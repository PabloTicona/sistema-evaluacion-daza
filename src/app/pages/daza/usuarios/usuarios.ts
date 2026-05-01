import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { RippleModule } from 'primeng/ripple';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SplitterModule } from 'primeng/splitter';
import { TabsModule } from 'primeng/tabs';
import { ToolbarModule } from 'primeng/toolbar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { HttpErrorHandler } from '@/app/http-error-handler.service';
import { User, UserDto } from './user-dto';
import { UsuarioService } from './usuario.service';
import { RecipeAssignmentService } from '../recetas/recipe-assignment.service'; // Import the new service
import { RecitasService } from '../recetas/recetas.service'; // Import RecitasService to get recipe details
import { Recipe } from '../recetas/recipe-dto'; // Import Recipe DTO
import { DataViewModule } from 'primeng/dataview'; // For displaying favorite recipes
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { ChipModule } from 'primeng/chip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-usuarios',
   standalone: true,
  imports: [
 CommonModule,
        FormsModule,
        ToolbarModule,
        ButtonModule,
        RippleModule,
        SplitButtonModule,
        AccordionModule,
        FieldsetModule,
        MenuModule,
        InputTextModule,
        DividerModule,
        SplitterModule,
        PanelModule,
        TabsModule,
        IconFieldModule,
        InputIconModule,
        AutoCompleteModule,
        AvatarModule,
        TooltipModule,
        DataViewModule,
        TagModule,
        RatingModule,
        ChipModule,
        ProgressSpinnerModule,
        SkeletonModule
  ],
  providers: [HttpErrorHandler, MessageService, UsuarioService, RecipeAssignmentService, RecitasService],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit {
    users: User[] = [];
    filteredUsers: User[] = [];
    selectedUser: User | null = null;
    searchQuery: string = '';
    loading: boolean = false;
    favoriteRecipes: Recipe[] = [];
    loadingFavoriteRecipes: boolean = false;
    skeletonItems: any[] = [{}, {}, {}, {}];

    constructor(
        private usuarioService: UsuarioService, 
        private recetasService: RecitasService,
        private recipeAssignmentService: RecipeAssignmentService,
        private cd: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.loading = true;
        this.usuarioService.getUsers().subscribe((response: UserDto) => {
            // Deferimos la actualización para el siguiente tick de la macro-tarea.
            // Esto garantiza que el cambio de estado ocurra fuera del ciclo de verificación actual.
            setTimeout(() => {
                this.users = response.users;
                this.filteredUsers = [...this.users];
                this.loading = false;
                this.cd.markForCheck(); // Notificamos a Angular del cambio de estado
            });
        });
    }

    items: MenuItem[] = [
        {
            label: 'Save',
            icon: 'pi pi-check'
        },
        {
            label: 'Update',
            icon: 'pi pi-upload'
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash'
        },
        {
            label: 'Home Page',
            icon: 'pi pi-home'
        }
    ];

    filterUsers(event: any) {
        const query = (event.query || '').toLowerCase();

        // Envolviendo en setTimeout evitamos conflictos si p-autocomplete 
        // dispara este método durante su fase de inicialización/renderizado.
        setTimeout(() => {
            if (!query) {
                this.filteredUsers = [...this.users];
            } else {
                this.filteredUsers = this.users.filter((user) => {
                    return (
                        user.firstName?.toLowerCase().includes(query) ||
                        user.lastName?.toLowerCase().includes(query) ||
                        user.username?.toLowerCase().includes(query)
                    );
                });
            }
            this.cd.markForCheck();
        });
    }

    onUserSelect(event: any) {
        this.selectedUser = event.value;
        this.searchQuery = '';
        if (this.selectedUser?.id) {
            this.loadFavoriteRecipes(this.selectedUser.id);
        }
    }

    clearSelection() {
        this.selectedUser = null;
        this.searchQuery = '';
        this.favoriteRecipes = [];
    }

    loadFavoriteRecipes(userId: number) {
        this.loadingFavoriteRecipes = true;
        const assignedIds = this.recipeAssignmentService.getAssignedRecipeIdsForUser(userId);
        
        if (assignedIds.size > 0) {
            this.recetasService.getRecipes(100, 0).subscribe((response) => {
                this.favoriteRecipes = response.recipes.filter(r => assignedIds.has(r.id));
                this.loadingFavoriteRecipes = false;
                this.cd.markForCheck();
            });
        } else {
            this.favoriteRecipes = [];
            this.loadingFavoriteRecipes = false;
            this.cd.markForCheck();
        }
    }

    getDifficultyTagSeverity(difficulty: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
        if (!difficulty) return 'info';
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'success';
            case 'medium': return 'warn';
            case 'hard': return 'danger';
            default: return 'info';
        }
    }

    getGenderIcon(gender: string | undefined) {
        if (gender === 'female') return 'pi pi-venus text-pink-500';
        if (gender === 'male') return 'pi pi-mars text-blue-500';
        return 'pi pi-user text-gray-500';
    }
}
