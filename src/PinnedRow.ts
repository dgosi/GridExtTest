/*
import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';
import * as ui from 'datagrok-api/ui';
import * as GridUtils from "../utils/GridUtils";
import * as PinnedUtils from "./PinnedUtils";
import {PinnedColumn} from "./PinnedColumn";
import * as TextUtils from "../utils/TextUtils";

export class PinnedRow {
    constructor(grid : DG.Grid, nRowTable : number) {

        //const grid = getGrid(colGrid);
        if(grid.canvas.parentNode === null)
            throw new Error("Parent node for canvas cannot be null.");

        this.m_fDevicePixelRatio = window.devicePixelRatio;
        const dart = DG.toDart(grid);

        if(dart.m_arPinnedRows === undefined)
            dart.m_arPinnedRows = [];

        if(dart.m_arPinnedRows.length === 0 && nRowTable >= 0) {
           new PinnedRow(grid, -1);
        }

        this.m_nTableRowIndex = nRowTable;

        const nH = nRowTable < 0 ? GridUtils.getGridColumnHeaderHeight(grid) : GridUtils.getGridRowHeight(grid);//px browser coordinated

        //Move Grid
        grid.canvas.style.top = (grid.canvas.offsetTop + nH).toString() + "px";
        grid.overlay.style.top= (grid.overlay.offsetTop + nH).toString() + "px";
        grid.canvas.style.height = (grid.canvas.offsetHeight - nH).toString() + "px";
        grid.overlay.style.height= (grid.overlay.offsetHeight - nH).toString() + "px";

        //Move vertical scroll bar
        const list = grid.root.querySelectorAll("div.d4-range-selector.d4-grid-vert-scroll");
        if(list.length > 0) {
            const e : any = list.item(0);
            e.style.top = (e.offsetTop + nH).toString() + "px";
           // e.style.height = (e.offsetHeight - nH).toString() + "px"; do not modify the height
        }

        const nHPinnedRowsTotal = PinnedUtils.getTotalPinnedRowsHeight(grid);
        const nWPinnedColsTotal = PinnedUtils.getTotalPinnedColsWidth(grid);
        const eCanvasThis = ui.canvas(grid.canvas.width + Math.round(nWPinnedColsTotal*window.devicePixelRatio), nH*window.devicePixelRatio);

        const tabIndex =  grid.canvas.getAttribute("tabIndex");
        if(tabIndex !== null)
            eCanvasThis.setAttribute("tabIndex", tabIndex);

        eCanvasThis.style.top =nHPinnedRowsTotal + "px";
        eCanvasThis.style.width = nWPinnedColsTotal + grid.canvas.offsetWidth + "px";
        eCanvasThis.style.height = nH + "px";
        eCanvasThis.style.position = "absolute";
        eCanvasThis.style.clear = "both";

        grid.canvas.parentNode.insertBefore(eCanvasThis,  grid.canvas);//colPinnedFirst !== null ? colPinnedFirst.getRoot() :

        dart.m_arPinnedRows.push(this);
        this.m_root = eCanvasThis;

        const rowThis = this;

        this.m_nColHeaderHeight = GridUtils.getGridColumnHeaderHeight(grid);
        grid.setOptions({
            colHeaderHeight: 0,
        });

        //OnResize Grid
        this.m_observerResizeGrid = new ResizeObserver(entries => {

            if(this.m_fDevicePixelRatio !== window.devicePixelRatio || grid.canvas.height !== eCanvasThis.height) {
                const nWPinnedColsTotalTmp = PinnedUtils.getTotalPinnedColsWidth(grid);
                eCanvasThis.width = grid.canvas.width + Math.round(nWPinnedColsTotalTmp*window.devicePixelRatio);
                eCanvasThis.height= nH*window.devicePixelRatio;
                eCanvasThis.style.width = nWPinnedColsTotalTmp + grid.canvas.offsetWidth + "px";
                eCanvasThis.style.height = nH + "px";

                this.m_fDevicePixelRatio = window.devicePixelRatio;
            }

            const g = eCanvasThis.getContext('2d');
            for (let entry of entries) {
                setTimeout(()=> {rowThis.paint(g, grid);}, 10);
            }
        });

       this.m_observerResizeGrid.observe(grid.canvas);

        const scrollHorz = grid.horzScroll;
        this.m_handlerHScroll = scrollHorz.onValuesChanged.subscribe(() => {
            const g = eCanvasThis.getContext('2d');
            rowThis.paint(g, grid);
        });
    }

    getHeight() : number {
        return this.m_root === null ? -1 : this.m_root.offsetHeight;
    }

    private paint(g : CanvasRenderingContext2D | null, grid : DG.Grid) : void {
        //const nWDiv = entry.contentBoxSize ? entry.contentBoxSize[0].inlineSize : entry.contentRect.width;
        if (g === null) {
            return;
        }

        if(this.m_root === null) {
            throw new Error('Root cannot be null.');
        }

        const dframe = grid.dataFrame;
        const nW = this.m_root.offsetWidth;
        const nH = this.m_root.offsetHeight;

        //Pinned Columns
        const nRG = 0;
        let colGrid = null;
        let cellRH = null;
        let nX: number = PinnedUtils.getTotalPinnedColsWidth(grid);

        //Regular Columns
        //g.save();
        //g.rect(nX*window.devicePixelRatio, 0, this.m_root.width, nH*window.devicePixelRatio);
        //g.clip();


        const arRowsCols = [-1,-1,-1,-1];
        GridUtils.fillVisibleViewportGridCells(arRowsCols, grid);
        const nColMin = arRowsCols[0];
        const nColMax = arRowsCols[1];

        const scrollHorz = grid.horzScroll;

        for(let nCol=nColMin; nCol<=nColMax; ++nCol) {

            colGrid = grid.columns.byIndex(nCol);
            if(colGrid === null || !colGrid.visible)
                continue;

            if(scrollHorz.min > colGrid.left) {
                nX += colGrid.left - scrollHorz.min;
            }

            if(this.m_nTableRowIndex < 0) {
                GridUtils.paintColHeaderCell(g, nX, 0, colGrid.width, nH, colGrid);
            }
            else {

                try {
                    cellRH = grid.cell(colGrid.name, nRG);
                } catch (e) //to address DG bug when everything is filtered
                {
                    continue;
                }

                let renderer: any = GridUtils.getGridColumnRenderer(colGrid);
                if (renderer === null) {
                    try {
                        renderer = cellRH.renderer;
                    } catch (e) {
                        console.error("Could not obtain renderer for DG cell. DG bug " + colGrid.name + " row " + nRG);
                        continue;
                    }
                }

                if (renderer === null || renderer === undefined) {
                    console.error("Couldn't find renderer for pinned column " + colGrid.name + " row " + nRG);
                    continue;
                }

                const font = cellRH.style.font;
                const nFontSize = TextUtils.getFontSize(font);
                const fontNew = TextUtils.setFontSize(font, Math.ceil(nFontSize * window.devicePixelRatio));
                if (fontNew !== null) {
                    cellRH.style.font = fontNew;
                }

                renderer.render(g, nX*window.devicePixelRatio, 0, colGrid.width*window.devicePixelRatio, nH*window.devicePixelRatio, cellRH, cellRH.style);
            }


           nX += colGrid.width;
        }
       // g.restore();

        nX = 0;
        let colPinned : PinnedColumn;
        const nPinnedColCount = PinnedUtils.getPinnedColumnCount(grid);
        for(let nPCol=0; nPCol<nPinnedColCount; ++nPCol) {
            colPinned = PinnedUtils.getPinnedColumn(nPCol, grid);
            colGrid = colPinned.getGridColumn();
            if(colGrid === null)
                throw new Error("Grid column cannot be null.");

            if(this.m_nTableRowIndex < 0) {
                GridUtils.paintColHeaderCell(g, nX, 0, colGrid.width, nH, colGrid);
            }
            else {

                try {
                    cellRH = grid.cell(colGrid.name, nRG);
                } catch (e) //to address DG bug when everything is filtered
                {
                    continue;
                }

                let renderer: any = GridUtils.getGridColumnRenderer(colGrid);
                if (renderer === null) {
                    try {
                        renderer = cellRH.renderer;
                    } catch (e) {
                        console.error("Could not obtain renderer for DG cell. DG bug " + colGrid.name + " row " + nRG);
                        continue;
                    }
                }

                if (renderer === null || renderer === undefined) {
                    console.error("Couldn't find renderer for pinned column " + colGrid.name + " row " + nRG);
                    continue;
                }

                const font = cellRH.style.font;
                const nFontSize = TextUtils.getFontSize(font);
                const fontNew = TextUtils.setFontSize(font, Math.ceil(nFontSize * window.devicePixelRatio));
                if (fontNew !== null) {
                    cellRH.style.font = fontNew;
                }

                renderer.render(g, nX*window.devicePixelRatio, 0, colGrid.width*window.devicePixelRatio, nH*window.devicePixelRatio, cellRH, cellRH.style);
            }


            nX += colGrid.width;

        }
    }


    private m_nColHeaderHeight : number;
    private m_nTableRowIndex : number;
    private m_root : HTMLCanvasElement | null;
    private m_observerResizeGrid : ResizeObserver | null;
    private m_handlerHScroll : any | null;
    private m_fDevicePixelRatio : number;
}
*/

