import { deleteUser } from 'aws-amplify/auth';

export const deleteTestAccount = async () => {
  try {
    await deleteUser();
  } catch (error) {
    console.error('Failed to delete test account:', error);
    throw error;
  }
};
