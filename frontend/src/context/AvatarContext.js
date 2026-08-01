import React, { createContext, useContext, useState } from 'react';

const DEFAULT_AVATAR_CONFIG = {
  gender: 'boy',
  suitColor: '#1e293b',
  shirtColor: '#ffffff',
  tieColor: '#dc2626',
  skinColor: '#f5d0a9',
  hairColor: '#1a1a1a',
  glasses: false,
};

const AvatarContext = createContext();

export const AvatarProvider = ({ children }) => {
  const [avatarConfig, setAvatarConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_3d_avatar_config');
      return saved ? JSON.parse(saved) : DEFAULT_AVATAR_CONFIG;
    } catch (e) {
      return DEFAULT_AVATAR_CONFIG;
    }
  });

  const updateAvatar = (newConfig) => {
    setAvatarConfig(newConfig);
    try {
      localStorage.setItem('crm_3d_avatar_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error('Could not save avatar config to localStorage', e);
    }
  };

  return (
    <AvatarContext.Provider value={{ avatarConfig, updateAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    return { avatarConfig: DEFAULT_AVATAR_CONFIG, updateAvatar: () => {} };
  }
  return context;
};
