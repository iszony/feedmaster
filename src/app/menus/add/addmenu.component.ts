import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { Menu, Mode, MenuItem } from '../../interfaces/menu';
import { Menufromserver } from '../../interfaces/menufromserver';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { MenuService } from '../../services/menu.service';
import { RecipeService } from '../../services/recipe.service';
@Component({
  selector: 'app-addmenu',
  templateUrl: './addmenu.component.html',
  styleUrls: ['./addmenu.component.scss']
})
export class AddmenuComponent implements OnInit {

  public menuData: Menu;
  public mode: Mode;
  public id: number;
  private cloneMenu: Menu;
  public isLoaded: boolean;
  public isloading: boolean;

  public refreshMenus : EventEmitter<Menufromserver[]>;


  constructor(private router: Router, private activatedRoute: ActivatedRoute, private http: HttpService, private menuService: MenuService, private recipeService: RecipeService) {
    this.mode = Mode[this.activatedRoute.snapshot.url[1].path];
    this.menuData = { name: '', items: [] };
    this.isLoaded = false;
    this.isloading = true;
    this.refreshMenus = new EventEmitter();
  }

  ngOnInit() {
    this.initMenu();
    this.setIsloaded();

  }

  setIsloading(loading: boolean){
    this.isloading = loading;
  }

  setIsloaded(){
    Promise.all([
      this.recipeService.loadIngredients(),
      this.recipeService.loadRecipes()
    ]).then(() => {
      this.isLoaded = true;
    });
  }

  addDayColumn() {
    this.cloneMenu.items.push({
      dayNumber: this.cloneMenu.items.length + 1,
      breakfastRecipeIDs: [],
      lunchRecipeIDs: [],
      dinnerSnackRecipeIDs: [],
      afternoonSnackRecipeIDs: [],
      forenoonSnackRecipeIDs: []
    });
  }

  deleteColumn(dayNumber) {
    this.cloneMenu.items = this.cloneMenu.items.filter(menuItem => menuItem.dayNumber !== dayNumber);
    this.refreshDayNumbers();
  }

  refreshDayNumbers() {
    this.cloneMenu.items = this.cloneMenu.items.map((item, index) => ({
      ...item,
      dayNumber: index + 1,
    }));
  }

  isEmptyMenuItem(m: MenuItem): boolean {
    let isEmpty = true;
    for (let key in m) {
      if (key !== 'dayNumber' && m[key].length !== 0) {
        isEmpty = false;
        return isEmpty;
      }
    }
    return isEmpty;
  }

  initMenu() {
    if (this.mode === Mode.add) {
      this.cloneMenu = {
        name: "",
        items: [],
        id: null
      }
      this.addDayColumn();
    } else if (this.mode === Mode.view) {
      this.id = +this.activatedRoute.snapshot.paramMap.get('id');
      this.menuService.getMenuById(this.id).then((menu) => {
        for (let i = menu.items.length - 1; i >= 0; i--) {
          if (this.isEmptyMenuItem(menu.items[i])) {
            menu.items.splice(i, 1);
          }
        }
        this.menuData = menu;
      });
      //serviceből lekérés id alapján ezután menuData feltöltése a megkapott adatokkal
      // this.http.getMenuIdFive().then((data)=>{
      //   console.log(JSON.parse(data));
      // });
      // this.menuData.name = 'Próba étlap';
      // this.menuData.items.push({
      //   dayNumber: this.menuData.items.length + 1,
      //   breakfastRecipeIDs: [1,2],
      //   lunchRecipeIDs: [],
      //   dinnerSnackRecipeIDs: [],
      //   afternoonSnackRecipeIDs: [],
      //   forenoonSnackRecipeIDs: []
      // });

    }
  }

  setMode(mode: string) {
    if (mode == Mode.edit) {
      this.cloneMenu = JSON.parse(JSON.stringify(this.menuData));
    } else if (mode == Mode.view) {

    }
    this.mode = Mode[mode];
  }

  saveMenu(): void {
    this.menuService.changeMenu(this.cloneMenu).then(() => {
      this.menuData = this.cloneMenu;
      this.setMode(Mode.view);
      let menu: Menufromserver = {
          menuId: null,
          menuName: '',
          numberOfDays: null,
      }

      menu.menuId = this.menuData.id;
      menu.menuName = this.menuData.name;
      menu.numberOfDays = this.menuData.items.length;

      this.menuService.menusofUser.forEach((m, i) => {
        if(m.menuId == this.menuData.id){
          this.menuService.menusofUser[i] = menu;
        }
      });
    }).catch();
  }

  addMenu(): void {
    this.menuService.addMenuToServer(this.cloneMenu).then((data) => {
      let menuDays = 0;
      let menu: Menufromserver = {
          menuId: null,
          menuName: '',
          numberOfDays: null,
      }

      data.items.forEach((t)=>{
        for (let key in t) {
          if(key !== 'dayNumber' && t[key].length != 0){
            menuDays++;
          }
        }
      });

      menu.menuId = data.id;
      menu.menuName = data.name;
      menu.numberOfDays = menuDays;

      this.menuService.menusofUser.push(menu);
      this.router.navigate(['/menus']);
    });
}
}
