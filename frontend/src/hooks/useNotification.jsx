import { toast } from 'react-hot-toast';

export const useNotification = () => {
  const showSuccess = (message) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#13a835',
        color: '#fff',
      },
    });
  };

  const showError = (message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#ac0011',
        color: '#fff',
      },
    });
  };

  const showWarning = (message) => {
    toast.warning(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#d6a000',
        color: '#fff',
      },
    });
  };

  const showInfo = (message) => {
    toast.info(message, {
      duration: 4000,
      position: 'top-right',
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};