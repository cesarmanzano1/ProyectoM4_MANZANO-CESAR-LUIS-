//src/services/taskService.ts
import {
  addDoc, collection, getDocs, query,
  serverTimestamp, where, type DocumentData,
  doc, updateDoc, deleteDoc
} from "firebase/firestore";
import { db } from "../services/firebase";
import type { NewTaskInput, Task } from "../types/task";
 
type TaskFirestoreDoc = Omit<Task, "id">;
 
function mapTask(docId: string, data: DocumentData): Task {
  const typed = data as TaskFirestoreDoc;
  return {
    id: docId,
    title: typed.title,
    completed: typed.completed,
    userId: typed.userId,
    createdAt: typed.createdAt,
  };
}
 
export async function getTasksByUser(userId: string): Promise<Task[]> {
  const q = query(collection(db, "tasks"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => mapTask(d.id, d.data()));
}
 
export async function addTask(input: NewTaskInput): Promise<Task> {
  const payload: Omit<Task, "id"> = {
    title: input.title,
    completed: false,
    userId: input.userId,
    createdAt: serverTimestamp() as unknown as Task["createdAt"],
  };
  const docRef = await addDoc(collection(db, "tasks"), payload);
  return { id: docRef.id, ...payload };
}

export async function toggleTask(id: string, completed: boolean): Promise<void> {
  const taskRef = doc(db, "tasks", id);
  await updateDoc(taskRef, { completed });
}

export async function deleteTask(id: string): Promise<void> {
  const taskRef = doc(db, "tasks", id);
  await deleteDoc(taskRef);
}