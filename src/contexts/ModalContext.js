import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  const toggleAddModal = useCallback(() => {
    setAddModalVisible(prev => !prev);
  }, []);

  const closeModal = useCallback(() => {
    setAddModalVisible(false);
  }, []);

  return (
    <ModalContext.Provider value={{ isAddModalVisible, toggleAddModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};
