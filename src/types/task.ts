//src/types/task.ts
import type { Timestamp } from "firebase/firestore";
 
export type Task = {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt?: Timestamp;
};
 
export type NewTaskInput = {
  title: string;
  userId: string;
};
