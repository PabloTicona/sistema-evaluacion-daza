import { Injectable } from '@angular/core';
import { User } from '../usuarios/user-dto'; // Asumiendo que User se define en user-dto.ts

@Injectable({
  providedIn: 'root'
})
export class RecipeAssignmentService {
  // Almacena las asignaciones: userId -> Set<recipeId>
  private assignments: Map<number, Set<number>> = new Map();

  constructor() {
    // Cargar asignaciones de localStorage si están disponibles
    const storedAssignments = localStorage.getItem('recipeAssignments');
    if (storedAssignments) {
      const parsed = JSON.parse(storedAssignments);
      for (const userIdStr in parsed) {
        if (Object.prototype.hasOwnProperty.call(parsed, userIdStr)) {
          const userId = parseInt(userIdStr, 10);
          this.assignments.set(userId, new Set(parsed[userIdStr]));
        }
      }
    }
  }

  private saveAssignments(): void {
    const serializableAssignments: { [userId: number]: number[] } = {};
    this.assignments.forEach((recipeIds, userId) => {
      serializableAssignments[userId] = Array.from(recipeIds);
    });
    localStorage.setItem('recipeAssignments', JSON.stringify(serializableAssignments));
  }

  assignRecipeToUser(userId: number, recipeId: number): boolean {
    if (!this.assignments.has(userId)) {
      this.assignments.set(userId, new Set());
    }
    const userRecipes = this.assignments.get(userId);
    if (userRecipes && !userRecipes.has(recipeId)) {
      userRecipes.add(recipeId);
      this.saveAssignments();
      return true;
    }
    return false; // Ya asignada
  }

  unassignRecipeFromUser(userId: number, recipeId: number): boolean {
    if (this.assignments.has(userId)) {
      const userRecipes = this.assignments.get(userId);
      if (userRecipes && userRecipes.delete(recipeId)) {
        if (userRecipes.size === 0) {
          this.assignments.delete(userId);
        }
        this.saveAssignments();
        return true;
      }
    }
    return false; // No asignada
  }

  getAssignedRecipeIdsForUser(userId: number): Set<number> {
    return this.assignments.get(userId) || new Set();
  }

  getUsersAssignedToRecipe(recipeId: number, allUsers: User[]): User[] {
    const assignedUsers: User[] = [];
    this.assignments.forEach((recipeIds, userId) => {
      if (recipeIds.has(recipeId)) {
        const user = allUsers.find(u => u.id === userId);
        if (user) {
          assignedUsers.push(user);
        }
      }
    });
    return assignedUsers;
  }
}