CREATE DATABASE  IF NOT EXISTS `crm_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `crm_db`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: crm_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_name` varchar(150) NOT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `website` varchar(150) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `gst_tax_id` varchar(50) DEFAULT NULL,
  `company_size` varchar(50) DEFAULT NULL,
  `account_owner` varchar(100) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,'Apex Digital Solutions','IT Services','www.apexdigital.com','Bangalore, India','GST29APEX001','100-250','Admin User',NULL,'2026-07-30 14:49:04',NULL),(2,'Nova Healthcare Systems','Healthcare','www.novahealth.org','Mumbai, India','GST27NOVA002','500-1000','Admin User',NULL,'2026-07-30 14:49:04',NULL),(3,'Zenith Logistics & Supply','Logistics','www.zenithlogistics.com','Chennai, India','GST33ZEN003','250-500','Admin User',NULL,'2026-07-30 14:49:04',NULL),(4,'Starlight Retail Group','Retail & E-Commerce','www.starlightretail.com','Delhi, India','GST07STAR004','50-100','Admin User',NULL,'2026-07-30 14:49:04',NULL),(5,'Quantum Financial Advisors','Banking & Finance','www.quantumfin.com','Mumbai, India','GST27QUAN005','100-250','Admin User',NULL,'2026-07-30 14:49:04',NULL),(6,'BlueSky Real Estate','Real Estate','www.blueskyrealestate.in','Hyderabad, India','GST36BLUE006','250-500','Admin User',NULL,'2026-07-30 14:49:04',NULL),(7,'Evolve EdTech Solutions','Education','www.evolveedtech.com','Pune, India','GST27EVOL007','20-50','Admin User',NULL,'2026-07-30 14:49:04',NULL),(8,'Nexus Renewable Energy','Clean Energy','www.nexusenergy.com','Ahmedabad, India','GST24NEX008','100-250','Admin User',NULL,'2026-07-30 14:49:04',NULL),(9,'CyberShield Technologies','Cybersecurity','www.cybershield.tech','Bangalore, India','GST29CYB009','50-100','Admin User',NULL,'2026-07-30 14:49:04',NULL),(10,'Global Dynamics Mfg','Manufacturing','www.globaldynamics.com','Kolkata, India','GST19GLOB010','1000+','Admin User',NULL,'2026-07-30 14:49:04',NULL),(11,'ABC Corporation','Manufacturing','www.abccorp.com','Mumbai, India','GST123456','200-500','Admin User',NULL,'2026-07-31 12:16:41',NULL),(12,'Techno Pvt Ltd','IT Services','www.techno.com','Delhi, India','GST654321','50-200','Admin User',NULL,'2026-07-31 12:16:41',NULL),(13,'ABC Corporation','Manufacturing','www.abccorp.com','Mumbai, India','GST123456','200-500','Admin User',NULL,'2026-07-31 16:43:37',NULL),(14,'Techno Pvt Ltd','IT Services','www.techno.com','Delhi, India','GST654321','50-200','Admin User',NULL,'2026-07-31 16:43:37',NULL),(15,'ABC Corporation','Manufacturing','www.abccorp.com','Mumbai, India','GST123456','200-500','Admin User',NULL,'2026-08-01 10:01:54',NULL),(16,'Techno Pvt Ltd','IT Services','www.techno.com','Delhi, India','GST654321','50-200','Admin User',NULL,'2026-08-01 10:01:54',NULL),(17,'ABC Corporation','Manufacturing','www.abccorp.com','Mumbai, India','GST123456','200-500','Admin User',NULL,'2026-08-02 06:42:32',NULL),(18,'Techno Pvt Ltd','IT Services','www.techno.com','Delhi, India','GST654321','50-200','Admin User',NULL,'2026-08-02 06:42:32',NULL),(19,'ABC Corporation','Manufacturing','www.abccorp.com','Mumbai, India','GST123456','200-500','Admin User',NULL,'2026-08-04 13:36:00',NULL),(20,'Techno Pvt Ltd','IT Services','www.techno.com','Delhi, India','GST654321','50-200','Admin User',NULL,'2026-08-04 13:36:00',NULL),(21,'ABC Corporation','Manufacturing','www.abccorp.com','Mumbai, India','GST123456','200-500','Admin User',NULL,'2026-08-05 13:20:43',NULL),(22,'Techno Pvt Ltd','IT Services','www.techno.com','Delhi, India','GST654321','50-200','Admin User',NULL,'2026-08-05 13:20:43',NULL),(23,'ABC Corporation','Manufacturing','www.abccorp.com','Mumbai, India','GST123456','200-500','Admin User',NULL,'2026-08-06 12:21:53',NULL),(24,'Techno Pvt Ltd','IT Services','www.techno.com','Delhi, India','GST654321','50-200','Admin User',NULL,'2026-08-06 12:21:53',NULL),(25,'ABC Corporation','Manufacturing','www.abccorp.com','Mumbai, India','GST123456','200-500','Admin User',NULL,'2026-08-09 04:42:17',NULL),(26,'Techno Pvt Ltd','IT Services','www.techno.com','Delhi, India','GST654321','50-200','Admin User',NULL,'2026-08-09 04:42:17',NULL),(27,'ABC Corporation','Manufacturing','www.abccorp.com','Mumbai, India','GST123456','200-500','Admin User',NULL,'2026-08-10 13:31:13',NULL),(28,'Techno Pvt Ltd','IT Services','www.techno.com','Delhi, India','GST654321','50-200','Admin User',NULL,'2026-08-10 13:31:13',NULL),(29,'Sunrise Co.','Technology & Services',NULL,NULL,NULL,NULL,'Admin User','Created from Lead #38','2026-08-10 15:10:21',NULL),(30,'Sunrise Co.','Technology & Services',NULL,NULL,NULL,NULL,'Admin User','Created from Lead #38','2026-08-10 16:13:38',NULL),(31,'ABC Corporation','Manufacturing','www.abccorp.com','Mumbai, India','GST123456','200-500','Admin User',NULL,'2026-08-11 13:49:49',NULL),(32,'Techno Pvt Ltd','IT Services','www.techno.com','Delhi, India','GST654321','50-200','Admin User',NULL,'2026-08-11 13:49:49',NULL);
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `with_person` varchar(100) DEFAULT NULL,
  `appointment_date` date DEFAULT NULL,
  `appointment_time` varchar(20) DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  `status` varchar(30) DEFAULT 'Scheduled',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,'Cloud Solution Review','Rajesh Verma (Apex)','2026-08-05','10:30 AM','Bangalore HQ','Scheduled','Discuss cloud server specs','2026-07-30 14:49:05',NULL),(2,'Hospital Integration Demo','Dr. Ananya Iyer (Nova)','2026-08-06','02:00 PM','Google Meet','Scheduled','Live CRM walkthrough','2026-07-30 14:49:05',NULL),(3,'Operations Sign-off','Vikram Singh (Zenith)','2026-07-16','11:00 AM','Chennai Office','Completed','Contract executed','2026-07-30 14:49:05',NULL),(4,'POS Requirements Gathering','Priya Nair (Starlight)','2026-08-08','04:00 PM','Zoom Meeting','Scheduled','E-commerce integration','2026-07-30 14:49:05',NULL),(5,'Audit Settlement Call','Amit Kulkarni (Quantum)','2026-08-01','03:30 PM','Phone Call','Scheduled','Payment timeline discussion','2026-07-30 14:49:05',NULL),(6,'ERP Site Survey','Sunita Kapoor (BlueSky)','2026-08-10','11:30 AM','Hyderabad Site','Scheduled','On-site technical survey','2026-07-30 14:49:05',NULL),(7,'LMS Portal Handover','Arjun Mehta (Evolve)','2026-07-12','10:00 AM','Pune Hub','Completed','Training session complete','2026-07-30 14:49:05',NULL),(8,'Solar Tech Briefing','Meera Joshi (Nexus)','2026-08-12','01:00 PM','Google Meet','Scheduled','Green energy data flow','2026-07-30 14:49:05',NULL),(9,'Security SOC Briefing','Rohan Deshmukh (CyberShield)','2026-08-03','05:00 PM','Bangalore Office','Cancelled','Threat detection demo','2026-07-30 14:49:05',NULL),(10,'Factory Automation Inspection','Sanjay Patel (Global Mfg)','2026-07-08','09:30 AM','Kolkata Plant','Completed','Final sign-off','2026-07-30 14:49:05',NULL);
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `user_email` varchar(150) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entity` varchar(50) NOT NULL,
  `record_id` int DEFAULT NULL,
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_entity_record` (`entity`,`record_id`),
  KEY `idx_audit_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,4,'test3@gmail.com','CREATE','contacts',29,'{\"email\": \"contact@sunrise.com\", \"notes\": \"Converted from Lead #38\", \"phone\": \"9876500003\", \"designation\": \"Decision Maker / Owner\", \"company_name\": \"Sunrise Co.\", \"contact_name\": \"Sunrise Team\", \"relationship\": \"Client\"}','::1','2026-08-10 15:10:21'),(2,4,'test3@gmail.com','CREATE','accounts',29,'{\"notes\": \"Created from Lead #38\", \"industry\": \"Technology & Services\", \"company_name\": \"Sunrise Co.\", \"account_owner\": \"Admin User\"}','::1','2026-08-10 15:10:21'),(3,4,'test3@gmail.com','CREATE','deals',56,'{\"stage\": \"Qualified\", \"value\": 350000, \"source\": \"Website\", \"deal_name\": \"Sunrise Co. - Web Development\", \"probability\": 40, \"account_name\": \"Sunrise Co.\", \"expected_close_date\": \"2026-09-09\"}','::1','2026-08-10 15:10:21'),(4,4,'test3@gmail.com','CREATE','tasks',38,'{\"type\": \"Call\", \"status\": \"Pending\", \"due_date\": \"2026-08-12\", \"priority\": \"High\", \"task_name\": \"Discovery Call with Sunrise Team\", \"related_to\": \"Sunrise Co.\"}','::1','2026-08-10 15:10:21'),(5,4,'test3@gmail.com','UPDATE','leads',38,'{\"lead_status\": \"Qualified\"}','::1','2026-08-10 15:10:21'),(6,4,'test3@gmail.com','CREATE','contacts',30,'{\"email\": \"contact@sunrise.com\", \"notes\": \"Converted from Lead #38\", \"phone\": \"9876500003\", \"designation\": \"Decision Maker / Owner\", \"company_name\": \"Sunrise Co.\", \"contact_name\": \"Sunrise Team\", \"relationship\": \"Client\"}','::1','2026-08-10 16:13:38'),(7,4,'test3@gmail.com','CREATE','accounts',30,'{\"notes\": \"Created from Lead #38\", \"industry\": \"Technology & Services\", \"company_name\": \"Sunrise Co.\", \"account_owner\": \"Admin User\"}','::1','2026-08-10 16:13:38'),(8,4,'test3@gmail.com','CREATE','deals',57,'{\"stage\": \"Qualified\", \"value\": 350000, \"source\": \"Website\", \"deal_name\": \"Sunrise Co. - Web Development\", \"probability\": 40, \"account_name\": \"Sunrise Co.\", \"expected_close_date\": \"2026-09-09\"}','::1','2026-08-10 16:13:38'),(9,4,'test3@gmail.com','CREATE','tasks',39,'{\"type\": \"Call\", \"status\": \"Pending\", \"due_date\": \"2026-08-12\", \"priority\": \"High\", \"task_name\": \"Discovery Call with Sunrise Team\", \"related_to\": \"Sunrise Co.\"}','::1','2026-08-10 16:13:38'),(10,4,'test3@gmail.com','UPDATE','leads',38,'{\"lead_status\": \"Qualified\"}','::1','2026-08-10 16:13:38'),(11,4,'test3@gmail.com','UPDATE','leads',36,'{\"email\": \"bharat@bharatind.com\", \"phone\": \"8263989254\", \"source\": \"Website\", \"lead_name\": \"Bharat Sharma\", \"assigned_to\": \"Admin User\", \"lead_status\": \"Contacted\", \"company_name\": \"Bharat Industries\", \"interested_in\": \"CRM Software\"}','::1','2026-08-10 16:59:35'),(12,4,'test3@gmail.com','CREATE','tasks',40,'{\"type\": \"Call\", \"notes\": \"Scheduled Message: \\\"Hello Prakash Rao,\\n\\nThank you for reaching out to Apex CRM! We would love to discuss your requirements and share a tailored demo.\\n\\nBest regards,\\nSales Team\\\" (Phone: 919876500002)\", \"status\": \"Pending\", \"due_date\": \"2026-08-10\", \"priority\": \"High\", \"task_name\": \"WhatsApp Scheduled Follow-up: Prakash Rao\", \"related_to\": \"Prakash Ltd.\"}','::1','2026-08-10 17:10:58'),(13,4,'test3@gmail.com','CREATE','tasks',41,'{\"type\": \"Call\", \"notes\": \"Scheduled Message: \\\"Dear Bharat Sharma,\\n\\nThis is a friendly reminder regarding your pending tax invoice. Please let us know if you need any assistance with settlement.\\n\\nThank you!\\\" (Phone: 918263989254)\", \"status\": \"Pending\", \"due_date\": \"2026-08-10\", \"priority\": \"High\", \"task_name\": \"WhatsApp Scheduled Follow-up: Bharat Sharma\", \"related_to\": \"Bharat Industries\"}','::1','2026-08-10 17:15:59'),(14,4,'test3@gmail.com','CREATE','tasks',42,'{\"type\": \"Call\", \"notes\": \"Scheduled Message: \\\"Hello Bharat Sharma,\\n\\nConfirming our scheduled discovery meeting. Looking forward to our discussion!\\n\\nBest regards,\\nApex Team\\\" (Phone: 918263989254, Method: api)\", \"status\": \"Pending\", \"due_date\": \"2026-08-10\", \"priority\": \"High\", \"task_name\": \"WhatsApp Scheduled (API Auto-Send): Bharat Sharma\", \"related_to\": \"Bharat Industries\"}','::1','2026-08-10 17:24:25'),(15,4,'test3@gmail.com','CREATE','leads',39,'{\"email\": \"kavita@novadynamics.io\", \"phone\": \"9876511223\", \"source\": \"Website Contact Form\", \"lead_name\": \"Kavita Rao\", \"assigned_to\": \"Admin User\", \"lead_status\": \"New\", \"company_name\": \"Nova Dynamics Tech\", \"created_date\": \"2026-08-10\", \"interested_in\": \"Enterprise Cloud CRM Platform\"}','::1','2026-08-10 17:43:22'),(16,4,'test3@gmail.com','CREATE','tasks',43,'{\"type\": \"Call\", \"notes\": \"Inbound website lead captured from Website Contact Form. Automated follow-up required.\", \"status\": \"Pending\", \"due_date\": \"2026-08-11\", \"priority\": \"High\", \"task_name\": \"Automated Discovery Call: Kavita Rao\", \"related_to\": \"Nova Dynamics Tech\"}','::1','2026-08-10 17:43:22'),(17,4,'test3@gmail.com','UPDATE','invoices',26,'{\"payment_status\": \"Paid\"}','::1','2026-08-10 17:52:47'),(18,4,'test3@gmail.com','CREATE','sprint_tasks',37,'{\"epic\": \"Planning\", \"title\": \"Kickoff & Architecture Review for Techno Pvt Ltd\", \"points\": 3, \"status\": \"IN PROGRESS\", \"priority\": \"High\", \"task_key\": \"TEC-101\", \"task_type\": \"story\", \"project_name\": \"Techno Pvt Ltd Implementation\", \"assignee_name\": \"Admin User\"}','::1','2026-08-10 17:52:47'),(19,4,'test3@gmail.com','CREATE','sprint_tasks',38,'{\"epic\": \"Core Dev\", \"title\": \"Core Module Development & Customizations\", \"points\": 8, \"status\": \"TO DO\", \"priority\": \"High\", \"task_key\": \"TEC-102\", \"task_type\": \"story\", \"project_name\": \"Techno Pvt Ltd Implementation\", \"assignee_name\": \"Admin User\"}','::1','2026-08-10 17:52:47'),(20,4,'test3@gmail.com','CREATE','sprint_tasks',39,'{\"epic\": \"Testing\", \"title\": \"Quality Assurance, Security Scan & UAT\", \"points\": 3, \"status\": \"TO DO\", \"priority\": \"High\", \"task_key\": \"TEC-103\", \"task_type\": \"bug\", \"project_name\": \"Techno Pvt Ltd Implementation\", \"assignee_name\": \"Admin User\"}','::1','2026-08-10 17:52:47');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaigns`
--

DROP TABLE IF EXISTS `campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaigns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_name` varchar(150) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `budget` decimal(12,2) DEFAULT '0.00',
  `status` varchar(30) DEFAULT 'Planned',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaigns`
--

LOCK TABLES `campaigns` WRITE;
/*!40000 ALTER TABLE `campaigns` DISABLE KEYS */;
INSERT INTO `campaigns` VALUES (1,'Q3 Enterprise Growth Campaign','Email','2026-07-01','2026-09-30',150000.00,'Active',NULL,'2026-07-30 14:49:05',NULL),(2,'Smart Automation Summit 2026','Event','2026-08-15','2026-08-17',300000.00,'Planned',NULL,'2026-07-30 14:49:05',NULL),(3,'Monsoon Offer 2026','Email','2026-07-01','2026-07-31',50000.00,'Active',NULL,'2026-07-31 12:16:42',NULL),(4,'Monsoon Offer 2026','Email','2026-07-01','2026-07-31',50000.00,'Active',NULL,'2026-07-31 16:43:38',NULL),(5,'Monsoon Offer 2026','Email','2026-07-01','2026-07-31',50000.00,'Active',NULL,'2026-08-01 10:01:54',NULL),(6,'Monsoon Offer 2026','Email','2026-07-01','2026-07-31',50000.00,'Active',NULL,'2026-08-02 06:42:32',NULL),(7,'Monsoon Offer 2026','Email','2026-07-01','2026-07-31',50000.00,'Active',NULL,'2026-08-04 13:36:00',NULL),(8,'Monsoon Offer 2026','Email','2026-07-01','2026-07-31',50000.00,'Active',NULL,'2026-08-05 13:20:43',NULL),(9,'Monsoon Offer 2026','Email','2026-07-01','2026-07-31',50000.00,'Active',NULL,'2026-08-06 12:21:53',NULL),(10,'Monsoon Offer 2026','Email','2026-07-01','2026-07-31',50000.00,'Active',NULL,'2026-08-09 04:42:17',NULL),(11,'Monsoon Offer 2026','Email','2026-07-01','2026-07-31',50000.00,'Active',NULL,'2026-08-10 13:31:13',NULL),(12,'Monsoon Offer 2026','Email','2026-07-01','2026-07-31',50000.00,'Active',NULL,'2026-08-11 13:49:49',NULL);
/*!40000 ALTER TABLE `campaigns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contact_name` varchar(100) NOT NULL,
  `company_name` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `relationship` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
INSERT INTO `contacts` VALUES (1,'Rajesh Verma','Apex Digital Solutions','rajesh@apexdigital.com','9876543210','Chief Executive Officer','Client','Bangalore, India',NULL,'2026-07-30 14:49:04',NULL),(2,'Dr. Ananya Iyer','Nova Healthcare Systems','ananya@novahealth.org','9876543211','Medical Director','Client','Mumbai, India',NULL,'2026-07-30 14:49:04',NULL),(3,'Vikram Singh','Zenith Logistics & Supply','vikram@zenithlogistics.com','9876543212','VP Operations','Client','Chennai, India',NULL,'2026-07-30 14:49:04',NULL),(4,'Priya Nair','Starlight Retail Group','priya@starlightretail.com','9876543213','Head of E-Commerce','Client','Delhi, India',NULL,'2026-07-30 14:49:04',NULL),(5,'Amit Kulkarni','Quantum Financial Advisors','amit@quantumfin.com','9876543214','Managing Partner','Partner','Mumbai, India',NULL,'2026-07-30 14:49:04',NULL),(6,'Sunita Kapoor','BlueSky Real Estate','sunita@blueskyrealestate.in','9876543215','General Manager','Client','Hyderabad, India',NULL,'2026-07-30 14:49:04',NULL),(7,'Arjun Mehta','Evolve EdTech Solutions','arjun@evolveedtech.com','9876543216','Product Head','Client','Pune, India',NULL,'2026-07-30 14:49:04',NULL),(8,'Meera Joshi','Nexus Renewable Energy','meera@nexusenergy.com','9876543217','Chief Sustainability Officer','Client','Ahmedabad, India',NULL,'2026-07-30 14:49:04',NULL),(9,'Rohan Deshmukh','CyberShield Technologies','rohan@cybershield.tech','9876543218','CISO','Vendor','Bangalore, India',NULL,'2026-07-30 14:49:04',NULL),(10,'Sanjay Patel','Global Dynamics Mfg','sanjay@globaldynamics.com','9876543219','Plant Director','Client','Kolkata, India',NULL,'2026-07-30 14:49:04',NULL),(11,'Ramesh Gupta','ABC Corp','ramesh@abccorp.com','9876500011','CTO','Client','Mumbai, India',NULL,'2026-07-31 12:16:41',NULL),(12,'Neha Singh','Techno Pvt Ltd','neha@techno.com','9876500012','HR Manager','Client','Delhi, India',NULL,'2026-07-31 12:16:41',NULL),(13,'Ramesh Gupta','ABC Corp','ramesh@abccorp.com','9876500011','CTO','Client','Mumbai, India',NULL,'2026-07-31 16:43:37',NULL),(14,'Neha Singh','Techno Pvt Ltd','neha@techno.com','9876500012','HR Manager','Client','Delhi, India',NULL,'2026-07-31 16:43:37',NULL),(15,'Ramesh Gupta','ABC Corp','ramesh@abccorp.com','9876500011','CTO','Client','Mumbai, India',NULL,'2026-08-01 10:01:54',NULL),(16,'Neha Singh','Techno Pvt Ltd','neha@techno.com','9876500012','HR Manager','Client','Delhi, India',NULL,'2026-08-01 10:01:54',NULL),(17,'Ramesh Gupta','ABC Corp','ramesh@abccorp.com','9876500011','CTO','Client','Mumbai, India',NULL,'2026-08-02 06:42:32',NULL),(18,'Neha Singh','Techno Pvt Ltd','neha@techno.com','9876500012','HR Manager','Client','Delhi, India',NULL,'2026-08-02 06:42:32',NULL),(19,'Ramesh Gupta','ABC Corp','ramesh@abccorp.com','9876500011','CTO','Client','Mumbai, India',NULL,'2026-08-04 13:36:00',NULL),(20,'Neha Singh','Techno Pvt Ltd','neha@techno.com','9876500012','HR Manager','Client','Delhi, India',NULL,'2026-08-04 13:36:00',NULL),(21,'Ramesh Gupta','ABC Corp','ramesh@abccorp.com','9876500011','CTO','Client','Mumbai, India',NULL,'2026-08-05 13:20:43',NULL),(22,'Neha Singh','Techno Pvt Ltd','neha@techno.com','9876500012','HR Manager','Client','Delhi, India',NULL,'2026-08-05 13:20:43',NULL),(23,'Ramesh Gupta','ABC Corp','ramesh@abccorp.com','9876500011','CTO','Client','Mumbai, India',NULL,'2026-08-06 12:21:53',NULL),(24,'Neha Singh','Techno Pvt Ltd','neha@techno.com','9876500012','HR Manager','Client','Delhi, India',NULL,'2026-08-06 12:21:53',NULL),(25,'Ramesh Gupta','ABC Corp','ramesh@abccorp.com','9876500011','CTO','Client','Mumbai, India',NULL,'2026-08-09 04:42:17',NULL),(26,'Neha Singh','Techno Pvt Ltd','neha@techno.com','9876500012','HR Manager','Client','Delhi, India',NULL,'2026-08-09 04:42:17',NULL),(27,'Ramesh Gupta','ABC Corp','ramesh@abccorp.com','9876500011','CTO','Client','Mumbai, India',NULL,'2026-08-10 13:31:13',NULL),(28,'Neha Singh','Techno Pvt Ltd','neha@techno.com','9876500012','HR Manager','Client','Delhi, India',NULL,'2026-08-10 13:31:13',NULL),(29,'Sunrise Team','Sunrise Co.','contact@sunrise.com','9876500003','Decision Maker / Owner','Client',NULL,'Converted from Lead #38','2026-08-10 15:10:21',NULL),(30,'Sunrise Team','Sunrise Co.','contact@sunrise.com','9876500003','Decision Maker / Owner','Client',NULL,'Converted from Lead #38','2026-08-10 16:13:38',NULL),(31,'Ramesh Gupta','ABC Corp','ramesh@abccorp.com','9876500011','CTO','Client','Mumbai, India',NULL,'2026-08-11 13:49:49',NULL),(32,'Neha Singh','Techno Pvt Ltd','neha@techno.com','9876500012','HR Manager','Client','Delhi, India',NULL,'2026-08-11 13:49:49',NULL);
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deals`
--

DROP TABLE IF EXISTS `deals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `deal_name` varchar(150) NOT NULL,
  `account_name` varchar(150) DEFAULT NULL,
  `value` decimal(12,2) DEFAULT '0.00',
  `stage` varchar(50) DEFAULT 'New Leads',
  `probability` int DEFAULT '0',
  `expected_close_date` date DEFAULT NULL,
  `source` varchar(50) DEFAULT NULL,
  `assigned_to` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_deals_stage_value` (`stage`,`value`),
  KEY `idx_deals_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deals`
--

LOCK TABLES `deals` WRITE;
/*!40000 ALTER TABLE `deals` DISABLE KEYS */;
INSERT INTO `deals` VALUES (1,'Apex Cloud Infrastructure','Apex Digital Solutions',1250000.00,'Proposal Sent',70,'2026-08-20','Website','Admin User','2026-07-30 14:49:04',NULL),(2,'Nova Hospital CRM Suite','Nova Healthcare Systems',820000.00,'Negotiation',80,'2026-08-25','Referral','Admin User','2026-07-30 14:49:04',NULL),(3,'Zenith Fleet Automation','Zenith Logistics & Supply',1500000.00,'Closed Won',100,'2026-07-15','Social Media','Admin User','2026-07-30 14:49:04',NULL),(4,'Starlight Omnichannel POS','Starlight Retail Group',650000.00,'Contacted',30,'2026-09-05','Email Campaign','Admin User','2026-07-30 14:49:04',NULL),(5,'Quantum Fintech Security','Quantum Financial Advisors',980000.00,'Negotiation',75,'2026-08-30','Walk-in','Admin User','2026-07-30 14:49:04',NULL),(6,'BlueSky Property ERP','BlueSky Real Estate',1800000.00,'Proposal Sent',65,'2026-09-15','Website','Admin User','2026-07-30 14:49:04',NULL),(7,'Evolve LMS Portal Suite','Evolve EdTech Solutions',540000.00,'Closed Lost',100,'2026-07-10','Referral','Admin User','2026-07-30 14:49:04',NULL),(8,'Nexus Solar Analytics Platform','Nexus Renewable Energy',1100000.00,'Contacted',40,'2026-09-20','Social Media','Admin User','2026-07-30 14:49:04',NULL),(9,'CyberShield SOC Automation','CyberShield Technologies',1420000.00,'Qualified',60,'2026-09-10','Email Campaign','Admin User','2026-07-30 14:49:04',NULL),(10,'Global Smart Factory IoT','Global Dynamics Mfg',2200000.00,'Closed Won',100,'2026-07-05','Walk-in','Admin User','2026-07-30 14:49:04',NULL),(11,'ABC Corp - CRM Deal','ABC Corporation',850000.00,'Negotiation',70,'2026-08-15','Website','Admin User','2026-07-31 12:16:41',NULL),(12,'Bharat Industries - ERP','Bharat Industries',620000.00,'Proposal Sent',50,'2026-08-20','Referral','Admin User','2026-07-31 12:16:41',NULL),(13,'Sunrise Co. - Website','Sunrise Co.',410000.00,'Qualified',40,'2026-09-01','Social Media','Admin User','2026-07-31 12:16:41',NULL),(14,'Techno Pvt Ltd - Support','Techno Pvt Ltd',380000.00,'Closed Won',100,'2026-07-10','Email Campaign','Admin User','2026-07-31 12:16:41',NULL),(15,'Prakash Ltd - Consulting','Prakash Ltd.',290000.00,'Contacted',20,'2026-09-10','Walk-in','Admin User','2026-07-31 12:16:41',NULL),(16,'ABC Corp - CRM Deal','ABC Corporation',850000.00,'Negotiation',70,'2026-08-15','Website','Admin User','2026-07-31 16:43:37',NULL),(17,'Bharat Industries - ERP','Bharat Industries',620000.00,'Proposal Sent',50,'2026-08-20','Referral','Admin User','2026-07-31 16:43:37',NULL),(18,'Sunrise Co. - Website','Sunrise Co.',410000.00,'Qualified',40,'2026-09-01','Social Media','Admin User','2026-07-31 16:43:37',NULL),(19,'Techno Pvt Ltd - Support','Techno Pvt Ltd',380000.00,'Closed Won',100,'2026-07-10','Email Campaign','Admin User','2026-07-31 16:43:37',NULL),(20,'Prakash Ltd - Consulting','Prakash Ltd.',290000.00,'Contacted',20,'2026-09-10','Walk-in','Admin User','2026-07-31 16:43:37',NULL),(21,'ABC Corp - CRM Deal','ABC Corporation',850000.00,'Negotiation',70,'2026-08-15','Website','Admin User','2026-08-01 10:01:54',NULL),(22,'Bharat Industries - ERP','Bharat Industries',620000.00,'Proposal Sent',50,'2026-08-20','Referral','Admin User','2026-08-01 10:01:54',NULL),(23,'Sunrise Co. - Website','Sunrise Co.',410000.00,'New Leads',40,'2026-09-01','Social Media','Admin User','2026-08-01 10:01:54',NULL),(24,'Techno Pvt Ltd - Support','Techno Pvt Ltd',380000.00,'Closed Won',100,'2026-07-10','Email Campaign','Admin User','2026-08-01 10:01:54',NULL),(25,'Prakash Ltd - Consulting','Prakash Ltd.',290000.00,'Qualified',20,'2026-09-10','Walk-in','Admin User','2026-08-01 10:01:54',NULL),(26,'ABC Corp - CRM Deal','ABC Corporation',850000.00,'Negotiation',70,'2026-08-15','Website','Admin User','2026-08-02 06:42:32',NULL),(27,'Bharat Industries - ERP','Bharat Industries',620000.00,'Proposal Sent',50,'2026-08-20','Referral','Admin User','2026-08-02 06:42:32',NULL),(28,'Sunrise Co. - Website','Sunrise Co.',410000.00,'Qualified',40,'2026-09-01','Social Media','Admin User','2026-08-02 06:42:32',NULL),(29,'Techno Pvt Ltd - Support','Techno Pvt Ltd',380000.00,'Closed Won',100,'2026-07-10','Email Campaign','Admin User','2026-08-02 06:42:32',NULL),(30,'Prakash Ltd - Consulting','Prakash Ltd.',290000.00,'Contacted',20,'2026-09-10','Walk-in','Admin User','2026-08-02 06:42:32',NULL),(31,'ABC Corp - CRM Deal','ABC Corporation',850000.00,'Negotiation',70,'2026-08-15','Website','Admin User','2026-08-04 13:36:00',NULL),(32,'Bharat Industries - ERP','Bharat Industries',620000.00,'Proposal Sent',50,'2026-08-20','Referral','Admin User','2026-08-04 13:36:00',NULL),(33,'Sunrise Co. - Website','Sunrise Co.',410000.00,'Qualified',40,'2026-09-01','Social Media','Admin User','2026-08-04 13:36:00',NULL),(34,'Techno Pvt Ltd - Support','Techno Pvt Ltd',380000.00,'Closed Won',100,'2026-07-10','Email Campaign','Admin User','2026-08-04 13:36:00',NULL),(35,'Prakash Ltd - Consulting','Prakash Ltd.',290000.00,'Contacted',20,'2026-09-10','Walk-in','Admin User','2026-08-04 13:36:00',NULL),(36,'ABC Corp - CRM Deal','ABC Corporation',850000.00,'Negotiation',70,'2026-08-15','Website','Admin User','2026-08-05 13:20:43',NULL),(37,'Bharat Industries - ERP','Bharat Industries',620000.00,'Proposal Sent',50,'2026-08-20','Referral','Admin User','2026-08-05 13:20:43',NULL),(38,'Sunrise Co. - Website','Sunrise Co.',410000.00,'Qualified',40,'2026-09-01','Social Media','Admin User','2026-08-05 13:20:43',NULL),(39,'Techno Pvt Ltd - Support','Techno Pvt Ltd',380000.00,'Closed Won',100,'2026-07-10','Email Campaign','Admin User','2026-08-05 13:20:43',NULL),(40,'Prakash Ltd - Consulting','Prakash Ltd.',290000.00,'Contacted',20,'2026-09-10','Walk-in','Admin User','2026-08-05 13:20:43',NULL),(41,'ABC Corp - CRM Deal','ABC Corporation',850000.00,'Negotiation',70,'2026-08-15','Website','Admin User','2026-08-06 12:21:53',NULL),(42,'Bharat Industries - ERP','Bharat Industries',620000.00,'Proposal Sent',50,'2026-08-20','Referral','Admin User','2026-08-06 12:21:53',NULL),(43,'Sunrise Co. - Website','Sunrise Co.',410000.00,'Qualified',40,'2026-09-01','Social Media','Admin User','2026-08-06 12:21:53',NULL),(44,'Techno Pvt Ltd - Support','Techno Pvt Ltd',380000.00,'Closed Won',100,'2026-07-10','Email Campaign','Admin User','2026-08-06 12:21:53',NULL),(45,'Prakash Ltd - Consulting','Prakash Ltd.',290000.00,'Contacted',20,'2026-09-10','Walk-in','Admin User','2026-08-06 12:21:53',NULL),(46,'ABC Corp - CRM Deal','ABC Corporation',850000.00,'Negotiation',70,'2026-08-15','Website','Admin User','2026-08-09 04:42:17',NULL),(47,'Bharat Industries - ERP','Bharat Industries',620000.00,'Proposal Sent',50,'2026-08-20','Referral','Admin User','2026-08-09 04:42:17',NULL),(48,'Sunrise Co. - Website','Sunrise Co.',410000.00,'Qualified',40,'2026-09-01','Social Media','Admin User','2026-08-09 04:42:17',NULL),(49,'Techno Pvt Ltd - Support','Techno Pvt Ltd',380000.00,'Closed Won',100,'2026-07-10','Email Campaign','Admin User','2026-08-09 04:42:17',NULL),(50,'Prakash Ltd - Consulting','Prakash Ltd.',290000.00,'Contacted',20,'2026-09-10','Walk-in','Admin User','2026-08-09 04:42:17',NULL),(51,'ABC Corp - CRM Deal','ABC Corporation',850000.00,'Negotiation',70,'2026-08-15','Website','Admin User','2026-08-10 13:31:13',NULL),(52,'Bharat Industries - ERP','Bharat Industries',620000.00,'Proposal Sent',50,'2026-08-20','Referral','Admin User','2026-08-10 13:31:13',NULL),(53,'Sunrise Co. - Website','Sunrise Co.',410000.00,'Qualified',40,'2026-09-01','Social Media','Admin User','2026-08-10 13:31:13',NULL),(54,'Techno Pvt Ltd - Support','Techno Pvt Ltd',380000.00,'Closed Won',100,'2026-07-10','Email Campaign','Admin User','2026-08-10 13:31:13',NULL),(55,'Prakash Ltd - Consulting','Prakash Ltd.',290000.00,'Contacted',20,'2026-09-10','Walk-in','Admin User','2026-08-10 13:31:13',NULL),(56,'Sunrise Co. - Web Development','Sunrise Co.',350000.00,'Qualified',40,'2026-09-09','Website',NULL,'2026-08-10 15:10:21',NULL),(57,'Sunrise Co. - Web Development','Sunrise Co.',350000.00,'Qualified',40,'2026-09-09','Website',NULL,'2026-08-10 16:13:38',NULL),(58,'ABC Corp - CRM Deal','ABC Corporation',850000.00,'Negotiation',70,'2026-08-15','Website','Admin User','2026-08-11 13:49:49',NULL),(59,'Bharat Industries - ERP','Bharat Industries',620000.00,'Proposal Sent',50,'2026-08-20','Referral','Admin User','2026-08-11 13:49:49',NULL),(60,'Sunrise Co. - Website','Sunrise Co.',410000.00,'Qualified',40,'2026-09-01','Social Media','Admin User','2026-08-11 13:49:49',NULL),(61,'Techno Pvt Ltd - Support','Techno Pvt Ltd',380000.00,'Closed Won',100,'2026-07-10','Email Campaign','Admin User','2026-08-11 13:49:49',NULL),(62,'Prakash Ltd - Consulting','Prakash Ltd.',290000.00,'Contacted',20,'2026-09-10','Walk-in','Admin User','2026-08-11 13:49:49',NULL);
/*!40000 ALTER TABLE `deals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) NOT NULL,
  `client_account` varchar(150) DEFAULT NULL,
  `invoice_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT '0.00',
  `paid_amount` decimal(12,2) DEFAULT '0.00',
  `payment_status` varchar(30) DEFAULT 'Pending',
  `payment_mode` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_invoices_status_date` (`payment_status`,`invoice_date`),
  KEY `idx_invoices_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,'INV-2026-001','Apex Digital Solutions','2026-07-01','2026-07-15',1250000.00,1250000.00,'Paid','Bank Transfer','2026-07-30 14:49:04',NULL),(2,'INV-2026-002','Nova Healthcare Systems','2026-07-05','2026-07-20',410000.00,0.00,'Pending','Cheque','2026-07-30 14:49:04',NULL),(3,'INV-2026-003','Zenith Logistics & Supply','2026-06-25','2026-07-10',1500000.00,1500000.00,'Paid','Bank Transfer','2026-07-30 14:49:04',NULL),(4,'INV-2026-004','Starlight Retail Group','2026-07-10','2026-07-25',325000.00,0.00,'Pending','Credit Card','2026-07-30 14:49:04',NULL),(5,'INV-2026-005','Quantum Financial Advisors','2026-06-15','2026-06-30',980000.00,0.00,'Overdue','Bank Transfer','2026-07-30 14:49:04',NULL),(6,'INV-2026-006','BlueSky Real Estate','2026-07-02','2026-07-17',900000.00,900000.00,'Paid','Cheque','2026-07-30 14:49:04',NULL),(7,'INV-2026-007','Evolve EdTech Solutions','2026-06-28','2026-07-12',540000.00,540000.00,'Paid','Bank Transfer','2026-07-30 14:49:04',NULL),(8,'INV-2026-008','Nexus Renewable Energy','2026-07-12','2026-07-27',550000.00,0.00,'Pending','Bank Transfer','2026-07-30 14:49:04',NULL),(9,'INV-2026-009','CyberShield Technologies','2026-07-08','2026-07-23',1420000.00,0.00,'Pending','NEFT','2026-07-30 14:49:04',NULL),(10,'INV-2026-010','Global Dynamics Mfg','2026-06-20','2026-07-05',2200000.00,2200000.00,'Paid','RTGS','2026-07-30 14:49:04',NULL),(11,'INV-1001','ABC Corporation','2026-07-01','2026-07-15',850000.00,850000.00,'Paid','Bank Transfer','2026-07-31 12:16:42',NULL),(12,'INV-1002','Techno Pvt Ltd','2026-07-05','2026-07-20',380000.00,150000.00,'Pending','Cheque','2026-07-31 12:16:42',NULL),(13,'INV-1001','ABC Corporation','2026-07-01','2026-07-15',850000.00,850000.00,'Paid','Bank Transfer','2026-07-31 16:43:38',NULL),(14,'INV-1002','Techno Pvt Ltd','2026-07-05','2026-07-20',380000.00,150000.00,'Pending','Cheque','2026-07-31 16:43:38',NULL),(15,'INV-1001','ABC Corporation','2026-07-01','2026-07-15',850000.00,850000.00,'Paid','Bank Transfer','2026-08-01 10:01:54',NULL),(16,'INV-1002','Techno Pvt Ltd','2026-07-05','2026-07-20',380000.00,150000.00,'Pending','Cheque','2026-08-01 10:01:54',NULL),(17,'INV-1001','ABC Corporation','2026-07-01','2026-07-15',850000.00,0.00,'Paid','Bank Transfer','2026-08-02 06:42:32',NULL),(18,'INV-1002','Techno Pvt Ltd','2026-07-05','2026-07-20',380000.00,0.00,'Pending','Cheque','2026-08-02 06:42:32',NULL),(19,'INV-1001','ABC Corporation','2026-07-01','2026-07-15',850000.00,0.00,'Paid','Bank Transfer','2026-08-04 13:36:00',NULL),(20,'INV-1002','Techno Pvt Ltd','2026-07-05','2026-07-20',380000.00,0.00,'Pending','Cheque','2026-08-04 13:36:00',NULL),(21,'INV-1001','ABC Corporation','2026-07-01','2026-07-15',850000.00,0.00,'Paid','Bank Transfer','2026-08-05 13:20:43',NULL),(22,'INV-1002','Techno Pvt Ltd','2026-07-05','2026-07-20',380000.00,0.00,'Pending','Cheque','2026-08-05 13:20:43',NULL),(23,'INV-1001','ABC Corporation','2026-07-01','2026-07-15',850000.00,0.00,'Paid','Bank Transfer','2026-08-06 12:21:53',NULL),(24,'INV-1002','Techno Pvt Ltd','2026-07-05','2026-07-20',380000.00,0.00,'Pending','Cheque','2026-08-06 12:21:53',NULL),(25,'INV-1001','ABC Corporation','2026-07-01','2026-07-15',850000.00,0.00,'Paid','Bank Transfer','2026-08-09 04:42:17',NULL),(26,'INV-1002','Techno Pvt Ltd','2026-07-05','2026-07-20',380000.00,0.00,'Paid','Cheque','2026-08-09 04:42:17',NULL),(27,'INV-1001','ABC Corporation','2026-07-01','2026-07-15',850000.00,0.00,'Paid','Bank Transfer','2026-08-10 13:31:13',NULL),(28,'INV-1002','Techno Pvt Ltd','2026-07-05','2026-07-20',380000.00,0.00,'Pending','Cheque','2026-08-10 13:31:13',NULL),(29,'INV-1001','ABC Corporation','2026-07-01','2026-07-15',850000.00,0.00,'Paid','Bank Transfer','2026-08-11 13:49:49',NULL),(30,'INV-1002','Techno Pvt Ltd','2026-07-05','2026-07-20',380000.00,0.00,'Pending','Cheque','2026-08-11 13:49:49',NULL);
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leads`
--

DROP TABLE IF EXISTS `leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lead_name` varchar(100) NOT NULL,
  `company_name` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `source` varchar(50) DEFAULT NULL,
  `interested_in` varchar(150) DEFAULT NULL,
  `lead_status` varchar(50) DEFAULT 'New',
  `assigned_to` varchar(100) DEFAULT NULL,
  `created_date` date DEFAULT (curdate()),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_leads_status_source` (`lead_status`,`source`),
  KEY `idx_leads_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leads`
--

LOCK TABLES `leads` WRITE;
/*!40000 ALTER TABLE `leads` DISABLE KEYS */;
INSERT INTO `leads` VALUES (1,'Apex Cloud Expansion','Apex Digital Solutions','rajesh@apexdigital.com','9876543210','Website','Cloud Infrastructure','Qualified','Admin User','2026-07-30','2026-07-30 14:49:04',NULL),(2,'Nova Hospital Integration','Nova Healthcare Systems','ananya@novahealth.org','9876543211','Referral','Hospital CRM Module','Contacted','Admin User','2026-07-30','2026-07-30 14:49:04',NULL),(3,'Zenith Fleet Tracking','Zenith Logistics & Supply','vikram@zenithlogistics.com','9876543212','Social Media','IoT Fleet Automation','Qualified','Admin User','2026-07-30','2026-07-30 14:49:04',NULL),(4,'Starlight Multi-Channel POS','Starlight Retail Group','priya@starlightretail.com','9876543213','Email Campaign','Omnichannel POS System','New','Admin User','2026-07-30','2026-07-30 14:49:04',NULL),(5,'Quantum Portal Audit','Quantum Financial Advisors','amit@quantumfin.com','9876543214','Walk-in','Fintech Security Suite','Qualified','Admin User','2026-07-30','2026-07-30 14:49:04',NULL),(6,'BlueSky ERP Rollout','BlueSky Real Estate','sunita@blueskyrealestate.in','9876543215','Website','Real Estate ERP','Contacted','Admin User','2026-07-30','2026-07-30 14:49:04',NULL),(7,'Evolve LMS Portal','Evolve EdTech Solutions','arjun@evolveedtech.com','9876543216','Referral','EdTech LMS Expansion','Qualified','Admin User','2026-07-30','2026-07-30 14:49:04',NULL),(8,'Nexus Solar Analytics','Nexus Renewable Energy','meera@nexusenergy.com','9876543217','Social Media','Clean Energy Analytics','New','Admin User','2026-07-30','2026-07-30 14:49:04',NULL),(9,'CyberShield SOC Platform','CyberShield Technologies','rohan@cybershield.tech','9876543218','Email Campaign','Security Operations Suite','Contacted','Admin User','2026-07-30','2026-07-30 14:49:04',NULL),(10,'Global Smart Factory IoT','Global Dynamics Mfg','sanjay@globaldynamics.com','9876543219','Walk-in','Smart Plant Automation','Qualified','Admin User','2026-07-30','2026-07-30 14:49:04',NULL),(11,'Bharat Sharma','Bharat Industries','bharat@bharatind.com','9876500001','Website','CRM Software','Contacted','Admin User','2026-07-31','2026-07-31 12:16:41',NULL),(12,'Prakash Rao','Prakash Ltd.','prakash@prakashltd.com','9876500002','Referral','ERP Software','New','Admin User','2026-07-31','2026-07-31 12:16:41',NULL),(13,'Sunrise Team','Sunrise Co.','contact@sunrise.com','9876500003','Social Media','Web Development','Qualified','Admin User','2026-07-31','2026-07-31 12:16:41',NULL),(14,'Bharat Sharma','Bharat Industries','bharat@bharatind.com','9876500001','Website','CRM Software','Contacted','Admin User','2026-07-31','2026-07-31 16:43:37',NULL),(15,'Prakash Rao','Prakash Ltd.','prakash@prakashltd.com','9876500002','Referral','ERP Software','New','Admin User','2026-07-31','2026-07-31 16:43:37',NULL),(16,'Sunrise Team','Sunrise Co.','contact@sunrise.com','9876500003','Social Media','Web Development','Qualified','Admin User','2026-07-31','2026-07-31 16:43:37',NULL),(17,'Bharat Sharma','Bharat Industries','bharat@bharatind.com','9876500001','Website','CRM Software','Contacted','Admin User','2026-08-01','2026-08-01 10:01:54',NULL),(18,'Prakash Rao','Prakash Ltd.','prakash@prakashltd.com','9876500002','Referral','ERP Software','New','Admin User','2026-08-01','2026-08-01 10:01:54',NULL),(19,'Sunrise Team','Sunrise Co.','contact@sunrise.com','9876500003','Social Media','Web Development','Qualified','Admin User','2026-08-01','2026-08-01 10:01:54',NULL),(20,'Bharat Sharma','Bharat Industries','bharat@bharatind.com','9876500001','Website','CRM Software','Contacted','Admin User','2026-08-02','2026-08-02 06:42:32',NULL),(21,'Prakash Rao','Prakash Ltd.','prakash@prakashltd.com','9876500002','Referral','ERP Software','New','Admin User','2026-08-02','2026-08-02 06:42:32',NULL),(22,'Sunrise Team','Sunrise Co.','contact@sunrise.com','9876500003','Social Media','Web Development','Qualified','Admin User','2026-08-02','2026-08-02 06:42:32',NULL),(23,'Bharat Sharma','Bharat Industries','bharat@bharatind.com','9876500001','Website','CRM Software','Contacted','Admin User','2026-08-04','2026-08-04 13:36:00',NULL),(24,'Prakash Rao','Prakash Ltd.','prakash@prakashltd.com','9876500002','Referral','ERP Software','New','Admin User','2026-08-04','2026-08-04 13:36:00',NULL),(25,'Sunrise Team','Sunrise Co.','contact@sunrise.com','9876500003','Social Media','Web Development','Qualified','Admin User','2026-08-04','2026-08-04 13:36:00',NULL),(26,'sai','test_company','test3@gmail.com','9232997362','Website','software','New','user','2026-08-04','2026-08-04 13:51:30',NULL),(27,'Bharat Sharma','Bharat Industries','bharat@bharatind.com','9876500001','Website','CRM Software','Contacted','Admin User','2026-08-05','2026-08-05 13:20:43',NULL),(28,'Prakash Rao','Prakash Ltd.','prakash@prakashltd.com','9876500002','Referral','ERP Software','New','Admin User','2026-08-05','2026-08-05 13:20:43',NULL),(29,'Sunrise Team','Sunrise Co.','contact@sunrise.com','9876500003','Social Media','Web Development','Qualified','Admin User','2026-08-05','2026-08-05 13:20:43',NULL),(30,'Bharat Sharma','Bharat Industries','bharat@bharatind.com','9876500001','Website','CRM Software','Contacted','Admin User','2026-08-06','2026-08-06 12:21:53',NULL),(31,'Prakash Rao','Prakash Ltd.','prakash@prakashltd.com','9876500002','Referral','ERP Software','New','Admin User','2026-08-06','2026-08-06 12:21:53',NULL),(32,'Sunrise Team','Sunrise Co.','contact@sunrise.com','9876500003','Social Media','Web Development','Qualified','Admin User','2026-08-06','2026-08-06 12:21:53',NULL),(33,'Bharat Sharma','Bharat Industries','bharat@bharatind.com','9876500001','Website','CRM Software','Contacted','Admin User','2026-08-09','2026-08-09 04:42:17',NULL),(34,'Prakash Rao','Prakash Ltd.','prakash@prakashltd.com','9876500002','Referral','ERP Software','New','Admin User','2026-08-09','2026-08-09 04:42:17',NULL),(35,'Sunrise Team','Sunrise Co.','contact@sunrise.com','9876500003','Social Media','Web Development','Qualified','Admin User','2026-08-09','2026-08-09 04:42:17',NULL),(36,'Bharat Sharma','Bharat Industries','bharat@bharatind.com','8263989254','Website','CRM Software','Contacted','Admin User','2026-08-10','2026-08-10 13:31:13',NULL),(37,'Prakash Rao','Prakash Ltd.','prakash@prakashltd.com','9876500002','Referral','ERP Software','New','Admin User','2026-08-10','2026-08-10 13:31:13',NULL),(38,'Sunrise Team','Sunrise Co.','contact@sunrise.com','9876500003','Social Media','Web Development','Qualified','Admin User','2026-08-10','2026-08-10 13:31:13',NULL),(39,'Kavita Rao','Nova Dynamics Tech','kavita@novadynamics.io','9876511223','Website Contact Form','Enterprise Cloud CRM Platform','New','Admin User','2026-08-10','2026-08-10 17:43:22',NULL),(40,'Bharat Sharma','Bharat Industries','bharat@bharatind.com','9876500001','Website','CRM Software','Contacted','Admin User','2026-08-11','2026-08-11 13:49:49',NULL),(41,'Prakash Rao','Prakash Ltd.','prakash@prakashltd.com','9876500002','Referral','ERP Software','New','Admin User','2026-08-11','2026-08-11 13:49:49',NULL),(42,'Sunrise Team','Sunrise Co.','contact@sunrise.com','9876500003','Social Media','Web Development','Qualified','Admin User','2026-08-11','2026-08-11 13:49:49',NULL);
/*!40000 ALTER TABLE `leads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(150) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) DEFAULT '0.00',
  `unit` varchar(30) DEFAULT NULL,
  `tax` decimal(5,2) DEFAULT '0.00',
  `status` varchar(30) DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Enterprise CRM License','Software','Annual CRM cloud user subscription',18000.00,'Per User',18.00,'Active','2026-07-30 14:49:05',NULL),(2,'Cloud ERP Module','Software','Integrated ERP system per organization',250000.00,'License',18.00,'Active','2026-07-30 14:49:05',NULL),(3,'IoT Fleet Automation','Hardware/Software','Real-time vehicle tracking GPS unit',35000.00,'Per Unit',18.00,'Active','2026-07-30 14:49:05',NULL),(4,'Security Audit Service','Service','End-to-end vulnerability assessment',120000.00,'Project',18.00,'Active','2026-07-30 14:49:05',NULL),(5,'CRM Software License','Software','Annual CRM license per user',15000.00,'Per User',18.00,'Active','2026-07-31 12:16:42',NULL),(6,'Website Development','Service','Custom business website',45000.00,'Project',18.00,'Active','2026-07-31 12:16:42',NULL),(7,'CRM Software License','Software','Annual CRM license per user',15000.00,'Per User',18.00,'Active','2026-07-31 16:43:38',NULL),(8,'Website Development','Service','Custom business website',45000.00,'Project',18.00,'Active','2026-07-31 16:43:38',NULL),(9,'CRM Software License','Software','Annual CRM license per user',15000.00,'Per User',18.00,'Active','2026-08-01 10:01:54',NULL),(10,'Website Development','Service','Custom business website',45000.00,'Project',18.00,'Active','2026-08-01 10:01:54',NULL),(11,'CRM Software License','Software','Annual CRM license per user',15000.00,'Per User',18.00,'Active','2026-08-02 06:42:32',NULL),(12,'Website Development','Service','Custom business website',45000.00,'Project',18.00,'Active','2026-08-02 06:42:32',NULL),(13,'CRM Software License','Software','Annual CRM license per user',15000.00,'Per User',18.00,'Active','2026-08-04 13:36:00',NULL),(14,'Website Development','Service','Custom business website',45000.00,'Project',18.00,'Active','2026-08-04 13:36:00',NULL),(15,'CRM Software License','Software','Annual CRM license per user',15000.00,'Per User',18.00,'Active','2026-08-05 13:20:43',NULL),(16,'Website Development','Service','Custom business website',45000.00,'Project',18.00,'Active','2026-08-05 13:20:43',NULL),(17,'CRM Software License','Software','Annual CRM license per user',15000.00,'Per User',18.00,'Active','2026-08-06 12:21:53',NULL),(18,'Website Development','Service','Custom business website',45000.00,'Project',18.00,'Active','2026-08-06 12:21:53',NULL),(19,'CRM Software License','Software','Annual CRM license per user',15000.00,'Per User',18.00,'Active','2026-08-09 04:42:17',NULL),(20,'Website Development','Service','Custom business website',45000.00,'Project',18.00,'Active','2026-08-09 04:42:17',NULL),(21,'CRM Software License','Software','Annual CRM license per user',15000.00,'Per User',18.00,'Active','2026-08-10 13:31:13',NULL),(22,'Website Development','Service','Custom business website',45000.00,'Project',18.00,'Active','2026-08-10 13:31:13',NULL),(23,'CRM Software License','Software','Annual CRM license per user',15000.00,'Per User',18.00,'Active','2026-08-11 13:49:49',NULL),(24,'Website Development','Service','Custom business website',45000.00,'Project',18.00,'Active','2026-08-11 13:49:49',NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotations`
--

DROP TABLE IF EXISTS `quotations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quotation_number` varchar(50) NOT NULL,
  `client_name` varchar(150) NOT NULL,
  `project_title` varchar(200) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT '0.00',
  `quotation_date` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `status` varchar(30) DEFAULT 'Draft',
  `terms` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotations`
--

LOCK TABLES `quotations` WRITE;
/*!40000 ALTER TABLE `quotations` DISABLE KEYS */;
INSERT INTO `quotations` VALUES (1,'QT-1001','Bharat Industries','Enterprise CRM & Automation Suite','bharat@bharatind.com','9876500001',650000.00,'2026-08-01','2026-08-15','Sent','50% Advance, 50% on project delivery.','2026-08-01 12:11:36',NULL),(2,'QT-1002','Prakash Ltd.','Cloud Infrastructure Migration','prakash@prakashltd.com','9876500002',420000.00,'2026-08-02','2026-08-17','Draft','GST (18%) extra as applicable.','2026-08-01 12:11:36',NULL),(3,'QT-1001','Bharat Industries','Enterprise CRM & Automation Suite','bharat@bharatind.com','9876500001',650000.00,'2026-08-01','2026-08-15','Sent','50% Advance, 50% on project delivery.','2026-08-02 06:42:32',NULL),(4,'QT-1002','Prakash Ltd.','Cloud Infrastructure Migration','prakash@prakashltd.com','9876500002',420000.00,'2026-08-02','2026-08-17','Draft','GST (18%) extra as applicable.','2026-08-02 06:42:32',NULL),(5,'QT-1001','Bharat Industries','Enterprise CRM & Automation Suite','bharat@bharatind.com','9876500001',650000.00,'2026-08-01','2026-08-15','Sent','50% Advance, 50% on project delivery.','2026-08-04 13:36:00',NULL),(6,'QT-1002','Prakash Ltd.','Cloud Infrastructure Migration','prakash@prakashltd.com','9876500002',420000.00,'2026-08-02','2026-08-17','Draft','GST (18%) extra as applicable.','2026-08-04 13:36:00',NULL),(7,'QT-1001','Bharat Industries','Enterprise CRM & Automation Suite','bharat@bharatind.com','9876500001',650000.00,'2026-08-01','2026-08-15','Sent','50% Advance, 50% on project delivery.','2026-08-05 13:20:43',NULL),(8,'QT-1002','Prakash Ltd.','Cloud Infrastructure Migration','prakash@prakashltd.com','9876500002',420000.00,'2026-08-02','2026-08-17','Draft','GST (18%) extra as applicable.','2026-08-05 13:20:43',NULL),(9,'QT-1001','Bharat Industries','Enterprise CRM & Automation Suite','bharat@bharatind.com','9876500001',650000.00,'2026-08-01','2026-08-15','Sent','50% Advance, 50% on project delivery.','2026-08-06 12:21:53',NULL),(10,'QT-1002','Prakash Ltd.','Cloud Infrastructure Migration','prakash@prakashltd.com','9876500002',420000.00,'2026-08-02','2026-08-17','Draft','GST (18%) extra as applicable.','2026-08-06 12:21:53',NULL),(11,'QT-1001','Bharat Industries','Enterprise CRM & Automation Suite','bharat@bharatind.com','9876500001',650000.00,'2026-08-01','2026-08-15','Sent','50% Advance, 50% on project delivery.','2026-08-09 04:42:17',NULL),(12,'QT-1002','Prakash Ltd.','Cloud Infrastructure Migration','prakash@prakashltd.com','9876500002',420000.00,'2026-08-02','2026-08-17','Draft','GST (18%) extra as applicable.','2026-08-09 04:42:17',NULL),(13,'QT-1001','Bharat Industries','Enterprise CRM & Automation Suite','bharat@bharatind.com','9876500001',650000.00,'2026-08-01','2026-08-15','Sent','50% Advance, 50% on project delivery.','2026-08-10 13:31:13',NULL),(14,'QT-1002','Prakash Ltd.','Cloud Infrastructure Migration','prakash@prakashltd.com','9876500002',420000.00,'2026-08-02','2026-08-17','Draft','GST (18%) extra as applicable.','2026-08-10 13:31:13',NULL),(15,'QT-1001','Bharat Industries','Enterprise CRM & Automation Suite','bharat@bharatind.com','9876500001',650000.00,'2026-08-01','2026-08-15','Sent','50% Advance, 50% on project delivery.','2026-08-11 13:49:49',NULL),(16,'QT-1002','Prakash Ltd.','Cloud Infrastructure Migration','prakash@prakashltd.com','9876500002',420000.00,'2026-08-02','2026-08-17','Draft','GST (18%) extra as applicable.','2026-08-11 13:49:49',NULL);
/*!40000 ALTER TABLE `quotations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(500) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sprint_tasks`
--

DROP TABLE IF EXISTS `sprint_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sprint_tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_key` varchar(30) NOT NULL,
  `title` text NOT NULL,
  `epic` varchar(100) DEFAULT 'General',
  `task_type` varchar(30) DEFAULT 'story',
  `points` int DEFAULT '1',
  `subtask_count` int DEFAULT '0',
  `priority` varchar(20) DEFAULT 'Medium',
  `status` varchar(30) DEFAULT 'TO DO',
  `assignee_name` varchar(100) DEFAULT 'Admin User',
  `assignee_avatar` varchar(255) DEFAULT '',
  `project_name` varchar(100) DEFAULT 'Beyond Gravity',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sprint_tasks`
--

LOCK TABLES `sprint_tasks` WRITE;
/*!40000 ALTER TABLE `sprint_tasks` DISABLE KEYS */;
INSERT INTO `sprint_tasks` VALUES (1,'NUC-205','Implement feedback collector','Feedback','story',9,0,'Low','TO DO','Sarah Jenkins','https://i.pravatar.cc/150?u=sarah','Beyond Gravity','2026-08-06 12:21:53',NULL),(2,'NUC-206','Bump version for new API for billing','Billing','bug',3,0,'Medium','TO DO','Alex Dev','https://i.pravatar.cc/150?u=alex','Beyond Gravity','2026-08-06 12:21:53',NULL),(3,'NUC-208','Add NPS feedback to wallboard','Feedback','task',1,0,'Low','TO DO','Elena Rostova','https://i.pravatar.cc/150?u=elena','Beyond Gravity','2026-08-06 12:21:53',NULL),(4,'NUC-213','Update T&C copy with v1.9 from the writers guild in all products that have cross country compliance','Legal & Compliance','bug',0,1,'High','IN PROGRESS','Sarah Jenkins','https://i.pravatar.cc/150?u=sarah','Beyond Gravity','2026-08-06 12:21:53',NULL),(5,'NUC-215','Tech spike on new stripe integration with paypal','Integrations','task',3,0,'High','IN PROGRESS','Michael Vance','https://i.pravatar.cc/150?u=michael','Beyond Gravity','2026-08-06 12:21:53',NULL),(6,'NUC-216','Refactor stripe verification key validator to a single call to avoid timing out on slow connections','Integrations','story',3,0,'High','IN PROGRESS','Claire Redfield','https://i.pravatar.cc/150?u=claire','Beyond Gravity','2026-08-06 12:21:53',NULL),(7,'NUC-217','Change phone number field type to \'phone\'','Core UI','task',0,1,'Low','IN PROGRESS','David Miller','https://i.pravatar.cc/150?u=david','Beyond Gravity','2026-08-06 12:21:53',NULL),(8,'NUC-338','Multi-dest search UI web','Search Engine','story',5,0,'High','IN REVIEW','Claire Redfield','https://i.pravatar.cc/150?u=claire','Beyond Gravity','2026-08-06 12:21:53',NULL),(9,'NUC-336','Quick booking for accomodations - web','Booking Engine','story',0,4,'Low','DONE','Michael Vance','https://i.pravatar.cc/150?u=michael','Beyond Gravity','2026-08-06 12:21:53',NULL),(10,'NUC-346','Adapt web app no new payments provider','Payment Gateway','bug',0,3,'Low','DONE','Sarah Jenkins','https://i.pravatar.cc/150?u=sarah','Beyond Gravity','2026-08-06 12:21:53',NULL),(11,'NUC-343','Fluid booking on tablets','Mobile & Tablet','story',5,0,'Medium','DONE','Michael Vance','https://i.pravatar.cc/150?u=michael','Beyond Gravity','2026-08-06 12:21:53',NULL),(12,'NUC-354','Shoping cart purchasing error - quick fix required.','Checkout System','bug',1,0,'High','DONE','Elena Rostova','https://i.pravatar.cc/150?u=elena','Beyond Gravity','2026-08-06 12:21:53',NULL),(13,'NUC-205','Implement feedback collector','Feedback','story',9,0,'Low','TO DO','Sarah Jenkins','https://i.pravatar.cc/150?u=sarah','Beyond Gravity','2026-08-09 04:42:17',NULL),(14,'NUC-206','Bump version for new API for billing','Billing','bug',3,0,'Medium','TO DO','Alex Dev','https://i.pravatar.cc/150?u=alex','Beyond Gravity','2026-08-09 04:42:17',NULL),(15,'NUC-208','Add NPS feedback to wallboard','Feedback','task',1,0,'Low','TO DO','Elena Rostova','https://i.pravatar.cc/150?u=elena','Beyond Gravity','2026-08-09 04:42:17',NULL),(16,'NUC-213','Update T&C copy with v1.9 from the writers guild in all products that have cross country compliance','Legal & Compliance','bug',0,1,'High','IN PROGRESS','Sarah Jenkins','https://i.pravatar.cc/150?u=sarah','Beyond Gravity','2026-08-09 04:42:17',NULL),(17,'NUC-215','Tech spike on new stripe integration with paypal','Integrations','task',3,0,'High','IN PROGRESS','Michael Vance','https://i.pravatar.cc/150?u=michael','Beyond Gravity','2026-08-09 04:42:17',NULL),(18,'NUC-216','Refactor stripe verification key validator to a single call to avoid timing out on slow connections','Integrations','story',3,0,'High','IN PROGRESS','Claire Redfield','https://i.pravatar.cc/150?u=claire','Beyond Gravity','2026-08-09 04:42:17',NULL),(19,'NUC-217','Change phone number field type to \'phone\'','Core UI','task',0,1,'Low','IN PROGRESS','David Miller','https://i.pravatar.cc/150?u=david','Beyond Gravity','2026-08-09 04:42:17',NULL),(20,'NUC-338','Multi-dest search UI web','Search Engine','story',5,0,'High','IN REVIEW','Claire Redfield','https://i.pravatar.cc/150?u=claire','Beyond Gravity','2026-08-09 04:42:17',NULL),(21,'NUC-336','Quick booking for accomodations - web','Booking Engine','story',0,4,'Low','DONE','Michael Vance','https://i.pravatar.cc/150?u=michael','Beyond Gravity','2026-08-09 04:42:17',NULL),(22,'NUC-346','Adapt web app no new payments provider','Payment Gateway','bug',0,3,'Low','DONE','Sarah Jenkins','https://i.pravatar.cc/150?u=sarah','Beyond Gravity','2026-08-09 04:42:17',NULL),(23,'NUC-343','Fluid booking on tablets','Mobile & Tablet','story',5,0,'Medium','DONE','Michael Vance','https://i.pravatar.cc/150?u=michael','Beyond Gravity','2026-08-09 04:42:17',NULL),(24,'NUC-354','Shoping cart purchasing error - quick fix required.','Checkout System','bug',1,0,'High','DONE','Elena Rostova','https://i.pravatar.cc/150?u=elena','Beyond Gravity','2026-08-09 04:42:17',NULL),(25,'NUC-205','Implement feedback collector','Feedback','story',9,0,'Low','TO DO','Sarah Jenkins','https://i.pravatar.cc/150?u=sarah','Beyond Gravity','2026-08-10 13:31:13',NULL),(26,'NUC-206','Bump version for new API for billing','Billing','bug',3,0,'Medium','TO DO','Alex Dev','https://i.pravatar.cc/150?u=alex','Beyond Gravity','2026-08-10 13:31:13',NULL),(27,'NUC-208','Add NPS feedback to wallboard','Feedback','task',1,0,'Low','TO DO','Elena Rostova','https://i.pravatar.cc/150?u=elena','Beyond Gravity','2026-08-10 13:31:13',NULL),(28,'NUC-213','Update T&C copy with v1.9 from the writers guild in all products that have cross country compliance','Legal & Compliance','bug',0,1,'High','IN PROGRESS','Sarah Jenkins','https://i.pravatar.cc/150?u=sarah','Beyond Gravity','2026-08-10 13:31:13',NULL),(29,'NUC-215','Tech spike on new stripe integration with paypal','Integrations','task',3,0,'High','IN PROGRESS','Michael Vance','https://i.pravatar.cc/150?u=michael','Beyond Gravity','2026-08-10 13:31:13',NULL),(30,'NUC-216','Refactor stripe verification key validator to a single call to avoid timing out on slow connections','Integrations','story',3,0,'High','IN PROGRESS','Claire Redfield','https://i.pravatar.cc/150?u=claire','Beyond Gravity','2026-08-10 13:31:13',NULL),(31,'NUC-217','Change phone number field type to \'phone\'','Core UI','task',0,1,'Low','IN PROGRESS','David Miller','https://i.pravatar.cc/150?u=david','Beyond Gravity','2026-08-10 13:31:13',NULL),(32,'NUC-338','Multi-dest search UI web','Search Engine','story',5,0,'High','IN REVIEW','Claire Redfield','https://i.pravatar.cc/150?u=claire','Beyond Gravity','2026-08-10 13:31:13',NULL),(33,'NUC-336','Quick booking for accomodations - web','Booking Engine','story',0,4,'Low','DONE','Michael Vance','https://i.pravatar.cc/150?u=michael','Beyond Gravity','2026-08-10 13:31:13',NULL),(34,'NUC-346','Adapt web app no new payments provider','Payment Gateway','bug',0,3,'Low','DONE','Sarah Jenkins','https://i.pravatar.cc/150?u=sarah','Beyond Gravity','2026-08-10 13:31:13',NULL),(35,'NUC-343','Fluid booking on tablets','Mobile & Tablet','story',5,0,'Medium','DONE','Michael Vance','https://i.pravatar.cc/150?u=michael','Beyond Gravity','2026-08-10 13:31:13',NULL),(36,'NUC-354','Shoping cart purchasing error - quick fix required.','Checkout System','bug',1,0,'High','DONE','Elena Rostova','https://i.pravatar.cc/150?u=elena','Beyond Gravity','2026-08-10 13:31:13',NULL),(37,'TEC-101','Kickoff & Architecture Review for Techno Pvt Ltd','Planning','story',3,0,'High','IN PROGRESS','Admin User','','Techno Pvt Ltd Implementation','2026-08-10 17:52:47',NULL),(38,'TEC-102','Core Module Development & Customizations','Core Dev','story',8,0,'High','TO DO','Admin User','','Techno Pvt Ltd Implementation','2026-08-10 17:52:47',NULL),(39,'TEC-103','Quality Assurance, Security Scan & UAT','Testing','bug',3,0,'High','TO DO','Admin User','','Techno Pvt Ltd Implementation','2026-08-10 17:52:47',NULL),(40,'NUC-205','Implement feedback collector','Feedback','story',9,0,'Low','TO DO','Sarah Jenkins','https://i.pravatar.cc/150?u=sarah','Beyond Gravity','2026-08-11 13:49:49',NULL),(41,'NUC-206','Bump version for new API for billing','Billing','bug',3,0,'Medium','TO DO','Alex Dev','https://i.pravatar.cc/150?u=alex','Beyond Gravity','2026-08-11 13:49:49',NULL),(42,'NUC-208','Add NPS feedback to wallboard','Feedback','task',1,0,'Low','TO DO','Elena Rostova','https://i.pravatar.cc/150?u=elena','Beyond Gravity','2026-08-11 13:49:49',NULL),(43,'NUC-213','Update T&C copy with v1.9 from the writers guild in all products that have cross country compliance','Legal & Compliance','bug',0,1,'High','IN PROGRESS','Sarah Jenkins','https://i.pravatar.cc/150?u=sarah','Beyond Gravity','2026-08-11 13:49:49',NULL),(44,'NUC-215','Tech spike on new stripe integration with paypal','Integrations','task',3,0,'High','IN PROGRESS','Michael Vance','https://i.pravatar.cc/150?u=michael','Beyond Gravity','2026-08-11 13:49:49',NULL),(45,'NUC-216','Refactor stripe verification key validator to a single call to avoid timing out on slow connections','Integrations','story',3,0,'High','IN PROGRESS','Claire Redfield','https://i.pravatar.cc/150?u=claire','Beyond Gravity','2026-08-11 13:49:49',NULL),(46,'NUC-217','Change phone number field type to \'phone\'','Core UI','task',0,1,'Low','IN PROGRESS','David Miller','https://i.pravatar.cc/150?u=david','Beyond Gravity','2026-08-11 13:49:49',NULL),(47,'NUC-338','Multi-dest search UI web','Search Engine','story',5,0,'High','IN REVIEW','Claire Redfield','https://i.pravatar.cc/150?u=claire','Beyond Gravity','2026-08-11 13:49:49',NULL),(48,'NUC-336','Quick booking for accomodations - web','Booking Engine','story',0,4,'Low','DONE','Michael Vance','https://i.pravatar.cc/150?u=michael','Beyond Gravity','2026-08-11 13:49:49',NULL),(49,'NUC-346','Adapt web app no new payments provider','Payment Gateway','bug',0,3,'Low','DONE','Sarah Jenkins','https://i.pravatar.cc/150?u=sarah','Beyond Gravity','2026-08-11 13:49:49',NULL),(50,'NUC-343','Fluid booking on tablets','Mobile & Tablet','story',5,0,'Medium','DONE','Michael Vance','https://i.pravatar.cc/150?u=michael','Beyond Gravity','2026-08-11 13:49:49',NULL),(51,'NUC-354','Shoping cart purchasing error - quick fix required.','Checkout System','bug',1,0,'High','DONE','Elena Rostova','https://i.pravatar.cc/150?u=elena','Beyond Gravity','2026-08-11 13:49:49',NULL);
/*!40000 ALTER TABLE `sprint_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_name` varchar(150) NOT NULL,
  `related_to` varchar(150) DEFAULT NULL,
  `type` varchar(50) DEFAULT 'Call',
  `due_date` date DEFAULT NULL,
  `priority` varchar(20) DEFAULT 'Medium',
  `status` varchar(30) DEFAULT 'Pending',
  `assigned_to` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tasks_status_due` (`status`,`due_date`),
  KEY `idx_tasks_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (1,'Present Cloud Architecture Deck','Apex Digital Solutions','Meeting','2026-08-05','High','In Progress','Admin User','2026-07-30 14:49:04',NULL),(2,'Schedule Hospital Security Review','Nova Healthcare Systems','Call','2026-08-06','High','Pending','Admin User','2026-07-30 14:49:04',NULL),(3,'Finalize Logistics Contract Signing','Zenith Logistics & Supply','Meeting','2026-07-16','Medium','Completed','Admin User','2026-07-30 14:49:04',NULL),(4,'Send Retail POS Trial License','Starlight Retail Group','Email','2026-08-08','Low','Pending','Admin User','2026-07-30 14:49:04',NULL),(5,'Follow up on Overdue Audit Invoice','Quantum Financial Advisors','Call','2026-08-01','High','Pending','Admin User','2026-07-30 14:49:04',NULL),(6,'Review Real Estate Blueprint Plans','BlueSky Real Estate','Meeting','2026-08-10','Medium','In Progress','Admin User','2026-07-30 14:49:04',NULL),(7,'Deploy EdTech LMS Production Build','Evolve EdTech Solutions','Email','2026-07-12','High','Completed','Admin User','2026-07-30 14:49:04',NULL),(8,'Prepare Clean Energy Proposal Draft','Nexus Renewable Energy','Email','2026-08-12','Medium','Pending','Admin User','2026-07-30 14:49:04',NULL),(9,'Conduct SOC Vulnerability Demo','CyberShield Technologies','Meeting','2026-08-04','High','Completed','Admin User','2026-07-30 14:49:04',NULL),(10,'Sign Smart Factory Handover Specs','Global Dynamics Mfg','Meeting','2026-07-07','Low','Completed','Admin User','2026-07-30 14:49:04',NULL),(11,'Follow up with ABC Corp','ABC Corporation','Call','2026-07-25','High','Pending','Admin User','2026-07-31 12:16:42',NULL),(12,'Send proposal to Bharat Industries','Bharat Industries','Email','2026-07-26','High','Pending','Admin User','2026-07-31 12:16:42',NULL),(13,'Call Prakash Ltd.','Prakash Ltd.','Call','2026-07-29','Medium','Pending','Admin User','2026-07-31 12:16:42',NULL),(14,'Follow up with ABC Corp','ABC Corporation','Call','2026-07-25','High','Pending','Admin User','2026-07-31 16:43:37',NULL),(15,'Send proposal to Bharat Industries','Bharat Industries','Email','2026-07-26','High','Pending','Admin User','2026-07-31 16:43:37',NULL),(17,'Follow up with ABC Corp','ABC Corporation','Call','2026-07-25','High','In Progress','Admin User','2026-08-01 10:01:54',NULL),(18,'Send proposal to Bharat Industries','Bharat Industries','Email','2026-07-26','High','In Progress','Admin User','2026-08-01 10:01:54',NULL),(19,'Call Prakash Ltd.','Prakash Ltd.','Call','2026-07-29','Medium','Pending','Admin User','2026-08-01 10:01:54',NULL),(20,'Follow up with ABC Corp','ABC Corporation','Call','2026-07-25','High','Pending','Admin User','2026-08-02 06:42:32',NULL),(21,'Send proposal to Bharat Industries','Bharat Industries','Email','2026-07-26','High','Pending','Admin User','2026-08-02 06:42:32',NULL),(22,'Call Prakash Ltd.','Prakash Ltd.','Call','2026-07-29','Medium','Pending','Admin User','2026-08-02 06:42:32',NULL),(23,'Follow up with ABC Corp','ABC Corporation','Call','2026-07-25','High','Pending','Admin User','2026-08-04 13:36:00',NULL),(24,'Send proposal to Bharat Industries','Bharat Industries','Email','2026-07-26','High','Pending','Admin User','2026-08-04 13:36:00',NULL),(25,'Call Prakash Ltd.','Prakash Ltd.','Call','2026-07-29','Medium','Pending','Admin User','2026-08-04 13:36:00',NULL),(26,'Follow up with ABC Corp','ABC Corporation','Call','2026-07-25','High','Pending','Admin User','2026-08-05 13:20:43',NULL),(27,'Send proposal to Bharat Industries','Bharat Industries','Email','2026-07-26','High','Pending','Admin User','2026-08-05 13:20:43',NULL),(28,'Call Prakash Ltd.','Prakash Ltd.','Call','2026-07-29','Medium','Pending','Admin User','2026-08-05 13:20:43',NULL),(29,'Follow up with ABC Corp','ABC Corporation','Call','2026-07-25','High','Pending','Admin User','2026-08-06 12:21:53',NULL),(30,'Send proposal to Bharat Industries','Bharat Industries','Email','2026-07-26','High','Pending','Admin User','2026-08-06 12:21:53',NULL),(31,'Call Prakash Ltd.','Prakash Ltd.','Call','2026-07-29','Medium','Pending','Admin User','2026-08-06 12:21:53',NULL),(32,'Follow up with ABC Corp','ABC Corporation','Call','2026-07-25','High','Pending','Admin User','2026-08-09 04:42:17',NULL),(33,'Send proposal to Bharat Industries','Bharat Industries','Email','2026-07-26','High','Pending','Admin User','2026-08-09 04:42:17',NULL),(34,'Call Prakash Ltd.','Prakash Ltd.','Call','2026-07-29','Medium','Pending','Admin User','2026-08-09 04:42:17',NULL),(35,'Follow up with ABC Corp','ABC Corporation','Call','2026-07-25','High','Pending','Admin User','2026-08-10 13:31:13',NULL),(36,'Send proposal to Bharat Industries','Bharat Industries','Email','2026-07-26','High','Pending','Admin User','2026-08-10 13:31:13',NULL),(37,'Call Prakash Ltd.','Prakash Ltd.','Call','2026-07-29','Medium','Pending','Admin User','2026-08-10 13:31:13',NULL),(38,'Discovery Call with Sunrise Team','Sunrise Co.','Call','2026-08-12','High','Pending',NULL,'2026-08-10 15:10:21',NULL),(39,'Discovery Call with Sunrise Team','Sunrise Co.','Call','2026-08-12','High','Pending',NULL,'2026-08-10 16:13:38',NULL),(40,'WhatsApp Scheduled Follow-up: Prakash Rao','Prakash Ltd.','Call','2026-08-10','High','Pending',NULL,'2026-08-10 17:10:58',NULL),(41,'WhatsApp Scheduled Follow-up: Bharat Sharma','Bharat Industries','Call','2026-08-10','High','Pending',NULL,'2026-08-10 17:15:59',NULL),(42,'WhatsApp Scheduled (API Auto-Send): Bharat Sharma','Bharat Industries','Call','2026-08-10','High','Pending',NULL,'2026-08-10 17:24:25',NULL),(43,'Automated Discovery Call: Kavita Rao','Nova Dynamics Tech','Call','2026-08-11','High','Pending',NULL,'2026-08-10 17:43:22',NULL),(44,'Follow up with ABC Corp','ABC Corporation','Call','2026-07-25','High','Pending','Admin User','2026-08-11 13:49:49',NULL),(45,'Send proposal to Bharat Industries','Bharat Industries','Email','2026-07-26','High','Pending','Admin User','2026-08-11 13:49:49',NULL),(46,'Call Prakash Ltd.','Prakash Ltd.','Call','2026-07-29','Medium','Pending','Admin User','2026-08-11 13:49:49',NULL);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject` varchar(150) NOT NULL,
  `client_name` varchar(100) DEFAULT NULL,
  `priority` varchar(20) DEFAULT 'Medium',
  `status` varchar(30) DEFAULT 'Open',
  `assigned_to` varchar(100) DEFAULT NULL,
  `created_date` date DEFAULT (curdate()),
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,'API rate limit query','Apex Digital Solutions','High','Open','Admin User','2026-07-30','Client requested higher API call limits.','2026-07-30 14:49:05',NULL),(2,'Invoice GST tax line clarification','Nova Healthcare Systems','Medium','In Progress','Admin User','2026-07-30','Clarification needed on tax breakdown.','2026-07-30 14:49:05',NULL),(3,'Login issue on portal','ABC Corporation','High','Open','Admin User','2026-07-31','Client unable to login to the CRM portal.','2026-07-31 12:16:42',NULL),(4,'Login issue on portal','ABC Corporation','High','Open','Admin User','2026-07-31','Client unable to login to the CRM portal.','2026-07-31 16:43:38',NULL),(5,'Login issue on portal','ABC Corporation','High','Open','Admin User','2026-08-01','Client unable to login to the CRM portal.','2026-08-01 10:01:54',NULL);
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profile_image` varchar(500) DEFAULT 'https://ui-avatars.com/api/?name=Admin+User&background=2563eb&color=fff',
  `role` varchar(50) DEFAULT 'Admin',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin User','admin@demo.com','$2a$10$ynUuSHyG75NK9D6U7AjcbOuqCUpY3ANGv14FHGouzjIyWHJTadSL6','https://ui-avatars.com/api/?name=Admin+User&background=2563eb&color=fff','Admin','2026-07-30 14:49:04'),(2,'Shruti Joshi','admin@crm.com','$2a$10$ynUuSHyG75NK9D6U7AjcbOuqCUpY3ANGv14FHGouzjIyWHJTadSL6','https://ui-avatars.com/api/?name=Shruti+Joshi&background=7c3aed&color=fff','Admin','2026-07-30 14:49:04'),(3,'Sales Manager','sales@demo.com','$2a$10$avuy1FuR6MLyiTbXVGByHuB/i6CQZjKq6SQExuKzp3iqIw0e5wh.K','https://ui-avatars.com/api/?name=Sales+Manager&background=059669&color=fff','User','2026-07-30 14:49:04'),(4,'Alex','test3@gmail.com','$2a$10$I4tdRZOQKooxtWAA40V2IOsOjtPRdOBH2SzVxxS.6FyikOY.tmPL6','https://ui-avatars.com/api/?name=Alex&background=2563eb&color=fff','Admin','2026-07-30 14:59:35');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-11 19:30:35
