import * as DG from 'datagrok-api/dg';
import * as grok from 'datagrok-api/grok';
import * as GridUtils from '@datagrok-libraries/gridext/src/utils/GridUtils';
import {PinnedColumn} from '@datagrok-libraries/gridext/src/pinned/PinnedColumn';
import * as PinnedUtils from '@datagrok-libraries/gridext/src/pinned/PinnedUtils';
import {ClickableTextRenderer} from "@datagrok-libraries/gridext/src/renderer/ClickableTextRenderer";
import {RendererUIManager} from "@datagrok-libraries/gridext/src/renderer/RendererUIManager";
import {IC50Renderer} from "./renderer/IC50Renderer";
import {TableView} from "datagrok-api/dg";
import {DateCellRenderer} from "@datagrok-libraries/gridext/src/renderer/DateCellRenderer";
import {PinnedRow} from "@datagrok-libraries/gridext/src/pinned/PinnedRow";


//tags: appp
//name: Test Date Renderer
export async function testDateRenderer() {
  const nRowCount = 100;
  const nColCount = 5;
  const dframe: DG.DataFrame = grok.data.demo.randomWalk(nRowCount, nColCount);
  const colDate = dframe.columns.addNewDateTime('New Date');
  for (let nR = 0; nR < nRowCount; ++nR) {
    colDate.set(nR, DG.DateTime.fromDate(new Date()));
  }

  const view: DG.TableView = grok.shell.addTableView(dframe);
  const grid = view.grid;
  const colGrid = grid.columns.byName("New Date");
  if(colGrid !== null) {
    GridUtils.setGridColumnRenderer(colGrid, new DateCellRenderer());
  }
  RendererUIManager.register(grid);
}

//tags: appp
//name: Test Image Renderer
export async function testImageRenderer() {

  const arImageIds : Array<number> = [6444430445, 6935160009, 6084362304, 6300953281,  6124910350, 7015802390,
                                      6472766114, 6129385674, 6985756270, 6967118011,  6464607535, 6444430447,
                                      6411110983, 7046137180, 6175741980, 6557796991,  6302612665, 6349429619,
                                      6207296571, 6561417677, 6230601747, 6175741975,  6221142141, 6557796992,
                                      6300063074, 6323500315, 6378639527, 6242506302,  6450267310, 6785001103];
  const nRowCount = 10;//arImageIds.length;
  const nColCount = 50;
  const dframe: DG.DataFrame = grok.data.demo.randomWalk(nRowCount, nColCount);
  const col = dframe.columns.addNewString('ImageId');
  dframe.columns.addNewString('AAA');
  const colRef = dframe.columns.byName('#1');
  for (let nR = 0; nR < nRowCount; ++nR) {
      colRef.set(nR, nR);
      //if(nR === 28)
       col.set(nR, arImageIds[nR].toString());
    }

  const view: DG.TableView = grok.shell.addTableView(dframe);
  const grid = view.grid;
  grid.setOptions({rowHeight:100});

  let colGrid : DG.GridColumn | null = grid.columns.byName('ImageId');
  if(colGrid !== null) {
    GridUtils.setGridColumnRenderer(colGrid, new IC50Renderer());
    let bSuccess = RendererUIManager.register(view.grid);
  }

  colGrid  = grid.columns.byName('#2');
  if(colGrid !== null) {
    GridUtils.setGridColumnRenderer(colGrid, new ClickableTextRenderer());
  }


  grok.events.onContextMenu.subscribe((args) => {

    PinnedUtils.handleContextMenu(args, (menu : DG.Menu, colGridOrPinned : DG.GridColumn | PinnedColumn, grid : DG.Grid) => {

      if(colGridOrPinned instanceof PinnedColumn) {
        menu = menu.item("Unpin Column", function () {
          colGridOrPinned.close();
        });

        menu = menu.item("Unpin All Columns", () => {
          PinnedUtils.closeAllPinnedColumns(grid);
        });
      }
      else {
        menu.item("Pin Column", () => {
          const colPinned = new PinnedColumn(colGridOrPinned);
        });
      }
    });
  });
}

//tags: app
//name: Test Clickable Renderer
export async function testClickableRenderer() {
  const nRowCount = 100;
  const nColCount = 500;
  const dframe: DG.DataFrame = grok.data.demo.randomWalk(nRowCount, nColCount);

  const view: DG.TableView = grok.shell.addTableView(dframe);
  const grid = view.grid;

  let colGrid : DG.GridColumn | null;
  const renderer = new ClickableTextRenderer();
  for(let nC=3; nC<4; ++nC) {
    colGrid = grid.columns.byIndex(nC);
    if(colGrid === null)
      continue;

    GridUtils.setGridColumnRenderer(colGrid, renderer);
  }

  let bSuccess = RendererUIManager.register(view.grid);
  if(!bSuccess)
    throw new Error("Failed to register Renderer UI manager");
 }


//tags: app
//name: Test Pinned Rows
export async function testPinnedRows() {
  const nRowCount = 100;
  const nColCount = 500;
  const dframe : DG.DataFrame = await grok.data.getDemoTable('chem/chembl/chembl-100k.csv');//grok.data.demo.randomWalk(nRowCount, nColCount);
  const col0 = dframe.columns.byIndex(0);
  col0.setTag('cell.renderer', 'Molecule');

  const view : DG.TableView = grok.shell.addTableView(dframe);
  /*
  view.grid.setOptions({
    colHeaderHeight: 30,
    rowHeight: 100
  });
*/
  grok.events.onContextMenu.subscribe((args) => {
    const grid = args.args.context;
    if (!(grid instanceof DG.Grid)) {
      return;
    }

    let menu = args.args.menu;
    menu.item("Pin Row", async() => {
      new PinnedRow(grid, 5);
    });


    PinnedUtils.handleContextMenu(args, (menu : DG.Menu, colGridOrPinned : DG.GridColumn | PinnedColumn, grid : DG.Grid) => {

      if(colGridOrPinned instanceof PinnedColumn) {
        const colGrid = colGridOrPinned.getGridColumn();
        if(colGrid !== null && !GridUtils.isRowHeader(colGrid)) {
          menu.item("Unpin Column", () => {
            colGridOrPinned.close();
          });
        }
        menu.item("Unpin All Columns", () => {
          PinnedUtils.closeAllPinnedColumns(grid);
        });
      }
      else {
        menu.item("Pin Column", async() => {
          PinnedUtils.addPinnedColumn(colGridOrPinned);
        });
      }
    });
  });
}

//tags: app
//name: Test Pinned Columns
export async function testPinnedColumns() {
/*
  grok.events.onViewAdded.subscribe(async (view) => {

    const lstLs = await grok.dapi.layouts.list();

    if(lstLs.length > 0) {
      const layoutLast = lstLs[lstLs.length -1];
      view.loadLayout(layoutLast);
      const grid = (view as TableView).grid;
      const colGrid0 = grid.columns.byIndex(0);
      if(colGrid0 !== null && colGrid0.grid === null){
        GridUtils.installGridForColumn(grid, colGrid0);
      }

      PinnedUtils.installPinnedColumns(grid);
    }
  });*/ //my changes


  const nRowCount = 100;
  const nColCount = 500;
  const dframe : DG.DataFrame = await grok.data.demo.randomWalk(nRowCount, nColCount);
  const col0 = dframe.columns.byIndex(0);

  const view : DG.TableView = grok.shell.addTableView(dframe);
 /*
  view.grid.setOptions({
    colHeaderHeight: 30,
    rowHeight: 100
  });*/

  grok.events.onContextMenu.subscribe((args) => {

    const grid = args.args.context;
    if (!(grid instanceof DG.Grid)) {
      return;
    }

    let menu = args.args.menu;
    menu.item("Pin Row", async() => {
      new PinnedRow(grid, 5);
    });

    PinnedUtils.handleContextMenu(args, (menu : DG.Menu, colGridOrPinned : DG.GridColumn | PinnedColumn, grid : DG.Grid) => {

      if(colGridOrPinned instanceof PinnedColumn) {
        const colGrid = colGridOrPinned.getGridColumn();
        if(colGrid !== null && !GridUtils.isRowHeader(colGrid)) {
        menu.item("Unpin Column", () => {
          colGridOrPinned.close();
        });
      }
          menu.item("Unpin All Columns", () => {
          PinnedUtils.closeAllPinnedColumns(grid);
        });
      }
      else {
        menu.item("Pin Column", async() => {
          PinnedUtils.addPinnedColumn(colGridOrPinned);
/*my changes
          const lstLs = await grok.dapi.layouts.list();
          let layoutLast = null;
          if(lstLs.length > 0) {
            layoutLast = lstLs[lstLs.length -1];
          }

          const layout = colGridOrPinned.grid.view.saveLayout();
          if(layoutLast !== null){
            layout.id = layoutLast.id;
          }
          await grok.dapi.layouts.save(layout);*/
        });
      }
    });
  });


  const lstLs = await grok.dapi.layouts.list();
  console.log('Layouts ' + lstLs.length);
  lstLs[0].newId()
/*
  grok.events.onViewerClosed.subscribe(async (args) => {
    const viewer:any = args.args.viewer;
    const layout = viewer.view.saveLayout();
    layout.id = "13b27150-1890-11ec-a7b9-eff30b5796ed";
    const json = layout.toJson();
    await grok.dapi.layouts.save(layout);
  });

  const lu = await grok.dapi.layouts.find("13b27150-1890-11ec-a7b9-eff30b5796ed");
  if(lu !== null) {
    view.loadLayout(lu);
  }*/
}



//tags: app
//name: Test Layout Bugs
export async function testDGBugs() {

  let dframe = await grok.data.getDemoTable('chem/chembl/chembl-100k.csv');
  const rdKitCellRenderer = await grok.functions.call('Chem:rdKitCellRenderer');
  const view : DG.TableView = grok.shell.addTableView(dframe);

  /*
  const nRowCount = 100;
  const nColCount = 500;

  const dframe : DG.DataFrame = grok.data.demo.randomWalk(nRowCount, nColCount);
  const view : DG.TableView = grok.shell.addTableView(dframe);
  const options : any = view.grid.getOptions(true);
  const nH = options.look.colHeaderHeight;
  console.log("nH= " + nH);*/
}



//tags: appp
//name: Test Layout Bugs
export async function testSavedLayoutBugs() {
   const nRowCount = 100;
   const nColCount = 500;

   let nCalllCount = 0
   grok.events.onViewAdded.subscribe( async (view) => {
    if(nCalllCount > 0)
      return;

    ++nCalllCount;
    const layout = view.saveLayout();
    console.log('id ' + layout.id);
    const json = layout.toJson();
    await grok.dapi.layouts.save(layout);

    const layoutFound = await grok.dapi.layouts.find(layout.id);

    //const dframeAnother : DG.DataFrame = grok.data.demo.randomWalk(nRowCount, nColCount);
    const viewAnother : DG.TableView = grok.shell.addTableView(grok.data.demo.demog());//grok.shell.addTableView(dframeAnother);

    viewAnother.loadLayout(layoutFound);

    const colGrid2 = viewAnother.grid.columns.byIndex(2);
    if(colGrid2 !== null){
      try{colGrid2.cellType = 'html';}
      catch(e){
        throw e;
      }
    }

    const colGrid0 = viewAnother.grid.columns.byIndex(0);
    if(colGrid0 !== null) {
      try {
        colGrid0.visible = false;
      } catch (e) {
        throw e;
      }
    }
  });


  const dframe : DG.DataFrame = grok.data.demo.randomWalk(nRowCount, nColCount);
  const view : DG.TableView = grok.shell.addTableView(dframe);
}

//tags: appp
//name: Test Demo Layout Bugs
export async function testLayoutBugs() {
  const strId = 'c3145fa0-dbe0-11ec-b42b-bbed3de88bc2';

  grok.events.onViewAdded.subscribe( async (view) => {
    const layoutFound = await grok.dapi.layouts.find(strId);
    view.loadLayout(layoutFound);

    const colGrid0 = viewAnother.grid.columns.byIndex(0);
    if(colGrid0 !== null) {
      try {
        colGrid0.visible = false;
      } catch (e) {
        throw e;
      }
    }
  });


  const viewAnother : DG.TableView = grok.shell.addTableView(grok.data.demo.demog());

}
