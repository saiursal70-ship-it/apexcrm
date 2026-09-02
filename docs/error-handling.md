# Error Handling & Resilience Architecture

## 1. Overview
This document outlines standard error classification, unified API error responses, frontend fallback strategies, and server-side fault tolerance across the CRM platform.

---

## 2. Standardized API Error Response Schema

All backend endpoints return errors matching a uniform JSON structure to ensure predictable parsing by the frontend client:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested task with ID 42 was not found.",
    "details": []
  }
}
```

---

## 3. HTTP Status Code Conventions

| Status Code | Usage Scenario | Example Trigger |
| :--- | :--- | :--- |
| **`200 OK`** | Successful read, update, or general request. | Data retrieved or entity updated. |
| **`201 Created`** | Successful entity creation. | New lead or task created. |
| **`400 Bad Request`** | Missing required parameters or invalid syntax. | Omitting `email` on registration. |
| **`401 Unauthorized`** | Missing, invalid, or expired JWT token. | Requesting protected route without token. |
| **`403 Forbidden`** | Authenticated user lacks permission. | Sales Rep trying to delete an Admin user. |
| **`404 Not Found`** | Requested resource ID does not exist. | Querying `/api/tasks/9999` (nonexistent). |
| **`409 Conflict`** | Duplicate key collision or state conflict. | Registering with an existing email. |
| **`500 Internal Server Error`** | Unhandled server or database exception. | Database connection failure or unhandled exception. |

---

## 4. Backend Error Handling Strategy

### A. Centralized Async Wrapper
Async route handlers must be wrapped or use structured `try/catch` blocks to prevent unhandled promise rejections:

```javascript
router.get('/tasks/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: { code: 'TASK_NOT_FOUND', message: 'Task not found' }
            });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        console.error('Error fetching task:', err);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve task' }
        });
    }
});
```

### B. Background Sweeper Fault Tolerance
The `TaskAutomationEngine` executes inside a guarded `try/catch` loop within `setInterval` to ensure background job errors never terminate the primary Node.js process:
```javascript
setInterval(async () => {
    try {
        await TaskAutomationEngine.runScheduledSweeps();
    } catch (err) {
        console.warn('Automation interval check warning:', err.message);
    }
}, 60000);
```

---

## 5. Frontend Error Handling & UI Fallbacks

1. **Axios Interceptors**: Intercept global 401 Unauthorized responses to automatically clear invalid sessions and redirect to `/login`.
2. **Toast & Alert Notifications**: Display user-friendly notification banners (e.g. *"Unable to save deal. Please check your network connection."*) without exposing raw stack traces.
3. **Empty & Loading States**: Every entity table and kanban board renders empty state placeholders with action prompts when zero items or errors occur.
4. **React Error Boundaries**: Critical page trees are isolated so a localized rendering failure does not crash the entire application.
