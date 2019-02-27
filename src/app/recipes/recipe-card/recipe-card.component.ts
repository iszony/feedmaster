import {
  Component,
  OnInit,
  OnChanges,
  Input,
  SimpleChanges,
  Output,
  ChangeDetectionStrategy
} from "@angular/core";
import { Recipe, Ingredient, NutritionData } from "src/app/interfaces/recipe";
import { RecipeService } from "src/app/services/recipe.service";

@Component({
  selector: "app-recipe-card",
  templateUrl: "./recipe-card.component.html",
  styleUrls: ["./recipe-card.component.scss"]
})
export class RecipeCardComponent implements OnInit, OnChanges {
  @Input() recipe: Recipe;
  @Output() data: NutritionData;
  editMode: boolean;
  recipeClone: Recipe;
  ingredients: Ingredient[];

  constructor(private recipeService: RecipeService) {
    this.resetData();
  }

  ngOnInit() {
    this.recipeService.calculateNutrition(this.recipe.recepieID);
    this.ingredients = this.recipeService.ingredients;
    this.data = this.recipeService.calculateNutrition(this.recipe.recepieID);
  }

  ngOnChanges(changes: SimpleChanges): void {}

  calculateNutrition() {
    let r: Recipe;
    if (this.editMode) {
      r = this.recipeClone;
    } else {
      r = this.recipe;
    }
    this.data = this.recipeService.calculateNutrition(r.recepieID);
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.cloneRecipe();
    }
  }

  getIngredient(id): Ingredient {
    return this.recipeService.getIngredientById(id);
  }

  addIngredient(): void {
    this.recipeClone.ingredients.push({
      ingredientId: null,
      ingredientQuantity: null
    });
  }

  deleteIngredient(id: number): void {
    let idx: number;
    this.recipeClone.ingredients.forEach((e, i) => {
      if (e.ingredientId === id) {
        idx = i;
      }
    });
    this.recipeClone.ingredients.splice(idx, 1);
  }

  private resetData(): void {
    this.data = {
      fat: 0,
      saturatedFat: 0,
      protein: 0,
      carbs: 0,
      sugar: 0,
      kcal: 0
    };
  }

  private cloneRecipe(): void {
    this.recipeClone = JSON.parse(JSON.stringify(this.recipe));
  }
}
