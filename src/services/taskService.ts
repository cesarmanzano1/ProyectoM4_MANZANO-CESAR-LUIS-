//src/services/taskService.ts
// import {
//   addDoc, collection, getDocs, query,
//   serverTimestamp, where, type DocumentData,
//   doc, updateDoc, deleteDoc
// } from "firebase/firestore";
// import { db } from "../services/firebase";
// import type { NewTaskInput, Task } from "../types/task";
 
// type TaskFirestoreDoc = Omit<Task, "id">;
 
// function mapTask(docId: string, data: DocumentData): Task {
//   const typed = data as TaskFirestoreDoc;
//   return {
//     id: docId,
//     title: typed.title,
//     completed: typed.completed,
//     userId: typed.userId,
//     createdAt: typed.createdAt,
//   };
// }
 
// export async function getTasksByUser(userId: string): Promise<Task[]> {
//   const q = query(collection(db, "tasks"), where("userId", "==", userId));
//   const snapshot = await getDocs(q);
//   return snapshot.docs.map((d) => mapTask(d.id, d.data()));
// }
 
// export async function addTask(input: NewTaskInput): Promise<Task> {
//   const payload: Omit<Task, "id"> = {
//     title: input.title,
//     completed: false,
//     userId: input.userId,
//     createdAt: serverTimestamp() as unknown as Task["createdAt"],
//   };
//   const docRef = await addDoc(collection(db, "tasks"), payload);
//   return { id: docRef.id, ...payload };
// }

// export async function toggleTask(id: string, completed: boolean): Promise<void> {
//   const taskRef = doc(db, "tasks", id);
//   await updateDoc(taskRef, { completed });
// }

// export async function deleteTask(id: string): Promise<void> {
//   const taskRef = doc(db, "tasks", id);
//   await deleteDoc(taskRef);
// }
//src/services/taskService.ts
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";

export type Task = {
  id: string;
  title: string;
  description?: string;
  createdBy?: string;
  assignedTo?: string;
  priority?: "Baja" | "Media" | "Alta" | "Urgente";
  dueDate?: string;
  folder: string;
  completed: boolean;
  isDeleted?: boolean; // <-- Soporte para papelera
  userId: string;
  createdAt?: unknown;
};

export async function getTasksByUser(userId: string): Promise<Task[]> {
  const q = query(collection(db, "tasks"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Task, "id">),
  }));
}

export async function addTask(input: {
  title: string;
  description?: string;
  createdBy?: string;
  assignedTo?: string;
  priority?: string;
  dueDate?: string;
  folder: string;
  userId: string;
}) {
  const docRef = await addDoc(collection(db, "tasks"), {
    title: input.title,
    description: input.description || "",
    createdBy: input.createdBy || "",
    assignedTo: input.assignedTo || "",
    priority: input.priority || "Media",
    dueDate: input.dueDate || "",
    folder: input.folder,
    completed: input.folder === "Completadas",
    isDeleted: false,
    userId: input.userId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function toggleTaskStatus(taskId: string, currentStatus: boolean, currentFolder: string) {
  const taskRef = doc(db, "tasks", taskId);
  const newCompleted = !currentStatus;
  await updateDoc(taskRef, { 
    completed: newCompleted,
    folder: newCompleted ? "Completadas" : currentFolder
  });
}

// Enviar a papelera (Soft delete)
export async function moveToTrash(taskId: string) {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, { isDeleted: true });
}

// Restaurar desde papelera
export async function restoreTask(taskId: string) {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, { isDeleted: false });
}

// Eliminar definitivamente de Firestore
export async function permanentDeleteTask(taskId: string) {
  const taskRef = doc(db, "tasks", taskId);
  await deleteDoc(taskRef);
}
export async function updateTask(taskId: string, input: {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  folder: string;
}) {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, {
    title: input.title,
    description: input.description || "",
    priority: input.priority || "Media",
    dueDate: input.dueDate || "",
    folder: input.folder,
    completed: input.folder === "Completadas"
  });
}

// Función para el ciclo del checkbox: Pendientes -> En Proceso -> Completadas -> Pendientes
export async function cycleTaskState(taskId: string, currentFolder: string) {
  const taskRef = doc(db, "tasks", taskId);
  let nextFolder = "Pendientes";
  let isCompleted = false;

  if (!currentFolder || currentFolder === "Pendientes") {
    nextFolder = "En Proceso";
    isCompleted = false;
  } else if (currentFolder === "En Proceso") {
    nextFolder = "Completadas";
    isCompleted = true;
  } else {
    nextFolder = "Pendientes";
    isCompleted = false;
  }

  await updateDoc(taskRef, {
    folder: nextFolder,
    completed: isCompleted
  });
}
export async function updateTaskPriority(taskId: string, newPriority: string) {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, { priority: newPriority });
}