import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpErrorHandler } from '@/app/http-error-handler.service';
import { RecitasService } from './recetas.service';
import { Recipe, RecipeDto } from './recipe-dto';
import { UsuarioService } from '../usuarios/usuario.service';
import { User, UserDto } from '../usuarios/user-dto';
import { RecipeAssignmentService } from './recipe-assignment.service';
import { AvatarModule } from 'primeng/avatar';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataViewModule,
    PaginatorModule,
    ButtonModule,
    DialogModule,
    TagModule,
    RatingModule,
    ToolbarModule,
    InputTextModule,
    MultiSelectModule,
    ToastModule,
    AvatarModule,
    ChipModule,
    DividerModule,
    ProgressSpinnerModule,
    SkeletonModule
  ],
  providers: [HttpErrorHandler, MessageService, RecitasService, UsuarioService, RecipeAssignmentService],
  templateUrl: './recetas.html',
  styleUrl: './recetas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecetasComponent implements OnInit {
  recipes: Recipe[] = [];
  totalRecords: number = 0;
  rows: number = 5;
  first: number = 0;
  loading: boolean = false;
  skeletonItems: any[] = [{}, {}, {}, {}, {}];

  selectedRecipe: Recipe | null = null;
  displayDetailsDialog: boolean = false;

  displayAssignUserDialog: boolean = false;
  users: User[] = [];
  selectedUsersForAssignment: User[] = [];

  displayAssignedUsersDialog: boolean = false;
  assignedUsersToRecipe: User[] = [];

  constructor(
    private recetasService: RecitasService,
    private usuarioService: UsuarioService,
    private recipeAssignmentService: RecipeAssignmentService,
    private messageService: MessageService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadRecipes(limit: number, skip: number): void {
    this.loading = true;
    this.recetasService.getRecipes(limit, skip).subscribe({
      next: (data: RecipeDto) => {
        this.recipes = data.recipes;
        this.totalRecords = data.total;
        this.loading = false;
        this.cd.markForCheck();
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las recetas.' });
        console.error('Error loading recipes:', error);
        this.loading = false;
        this.cd.markForCheck();
      }
    });
  }

  loadUsers(): void {
    this.usuarioService.getUsers().subscribe({
      next: (data: UserDto) => {
        this.users = data.users;
        this.cd.markForCheck();
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los usuarios.' });
        console.error('Error loading users:', error);
        this.cd.markForCheck();
      }
    });
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.loadRecipes(this.rows, this.first);
  }

  showRecipeDetails(recipe: Recipe): void {
    this.selectedRecipe = recipe;
    this.displayDetailsDialog = true;
  }

  showAssignUserDialog(recipe: Recipe): void {
    this.selectedRecipe = recipe;
    // Pre-seleccionar usuarios ya asignados a esta receta
    const assignedUserIds = this.recipeAssignmentService.getUsersAssignedToRecipe(recipe.id, this.users).map(u => u.id);
    this.selectedUsersForAssignment = this.users.filter(user => assignedUserIds.includes(user.id));
    this.displayAssignUserDialog = true;
  }

  assignUsersToRecipe(): void {
    const recipe = this.selectedRecipe;
    if (recipe && recipe.id && this.selectedUsersForAssignment) {
      const recipeId = recipe.id;
      const currentAssignedUserIds = this.recipeAssignmentService.getUsersAssignedToRecipe(recipeId, this.users)
        .map(u => u.id)
        .filter((id): id is number => typeof id === 'number' && id !== undefined);

      const newlySelectedUserIds = this.selectedUsersForAssignment
        .map(u => u.id)
        .filter((id): id is number => typeof id === 'number' && id !== undefined);

      currentAssignedUserIds.forEach((userId: number) => {
        if (!newlySelectedUserIds.includes(userId)) {
          this.recipeAssignmentService.unassignRecipeFromUser(userId, recipeId);
        }
      });

      newlySelectedUserIds.forEach((userId: number) => {
        this.recipeAssignmentService.assignRecipeToUser(userId, recipeId);
      });

      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Usuarios asignados a la receta "${recipe.name}"` });
      this.displayAssignUserDialog = false;
      this.selectedUsersForAssignment = [];
      this.selectedRecipe = null;
      this.cd.markForCheck();
    }
  }

  showAssignedUsers(recipe: Recipe): void {
    this.selectedRecipe = recipe;
    this.assignedUsersToRecipe = this.recipeAssignmentService.getUsersAssignedToRecipe(recipe.id, this.users);
    this.displayAssignedUsersDialog = true;
  }

  getDifficultyTagSeverity(difficulty: string | undefined): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    if (!difficulty) return undefined;

    switch (difficulty.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warn';
      case 'hard': return 'danger';
      default: return 'info';
    }
  }
}