import { Style } from '../types/style';
import { getStyles } from '../api/styleApi';

export const fetchStyles = async (): Promise<Style[]> => {
  try {
    return await getStyles();
  } catch (error) {
    console.error('Style service error:', error);
    throw error;
  }
};
