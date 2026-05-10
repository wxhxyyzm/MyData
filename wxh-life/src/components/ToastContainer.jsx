import { useToast } from '../hooks/useToast';
import Toast from './Toast';

export default function ToastContainer() {
  const { toast } = useToast();
  if (!toast) return null;
  return <Toast key={toast.id} message={toast.message} />;
}
