import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { ProviderReport } from '../domain/model/provider-report.entity';
import { StockReport } from '../domain/model/stock-report.entity';
import { ExpiringProductReport } from '../domain/model/expiring-product-report.entity';
import { LowStockReport } from '../domain/model/low-stock-report.entity';

/**
 * Service for exporting reports to Excel format with advanced formatting.
 * @remarks
 * This service handles the conversion of report data to Excel files with styles, colors, and formatting.
 */
@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {
  /**
   * Exports providers report to Excel with advanced formatting.
   * @param data - Array of ProviderReport entities.
   * @param filename - Name of the Excel file (without extension).
   */
  async exportProvidersReport(data: ProviderReport[], filename: string = 'reporte-proveedores'): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Proveedores');

    // Define styles
    const headerStyle = this.getHeaderStyle();
    const titleStyle = this.getTitleStyle();

    // Add title
    worksheet.mergeCells('A1:F1');
    const titleRow = worksheet.getRow(1);
    titleRow.getCell(1).value = 'REPORTE DE PROVEEDORES';
    titleRow.getCell(1).style = titleStyle;
    titleRow.height = 30;

    // Add date
    worksheet.mergeCells('A2:F2');
    const dateRow = worksheet.getRow(2);
    dateRow.getCell(1).value = `Fecha de generación: ${this.getFormattedDateTime()}`;
    dateRow.getCell(1).style = { font: { size: 10, italic: true } };
    dateRow.height = 20;

    // Add summary
    worksheet.mergeCells('A3:F3');
    const summaryRow = worksheet.getRow(3);
    summaryRow.getCell(1).value = `Total de proveedores: ${data.length}`;
    summaryRow.getCell(1).style = { font: { size: 11, bold: true } };
    summaryRow.height = 20;

    // Add headers
    const headers = ['Nombre', 'RUC', 'Correo Electrónico', 'Teléfono', 'Productos'];
    const headerRow = worksheet.getRow(4);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.style = headerStyle;
    });
    headerRow.height = 25;

    // Add data
    data.forEach((provider, index) => {
      const row = worksheet.getRow(5 + index);
      row.getCell(1).value = provider.fullName;
      row.getCell(2).value = provider.ruc;
      row.getCell(3).value = provider.email;
      row.getCell(4).value = provider.phoneNumber;
      // Show product names instead of count
      const productsText = provider.productNames && provider.productNames.length > 0
        ? provider.productNames.join(', ')
        : '-';
      row.getCell(5).value = productsText;
      row.getCell(5).style = {
        alignment: { horizontal: 'left', vertical: 'top', wrapText: true }
      };

      // Alternate row colors
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' }
        };
      }
    });

    // Set column widths
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 40;

    // Add borders
    this.addBorders(worksheet, 4, 4 + data.length, 1, 5);

    await this.saveWorkbook(workbook, filename);
  }

  /**
   * Exports stock report to Excel with advanced formatting.
   * @param data - Array of StockReport entities.
   * @param filename - Name of the Excel file (without extension).
   */
  async exportStockReport(data: StockReport[], filename: string = 'reporte-stock'): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stock Actual');

    const headerStyle = this.getHeaderStyle();
    const titleStyle = this.getTitleStyle();

    // Add title
    worksheet.mergeCells('A1:I1');
    const titleRow = worksheet.getRow(1);
    titleRow.getCell(1).value = 'REPORTE DE STOCK ACTUAL';
    titleRow.getCell(1).style = titleStyle;
    titleRow.height = 30;

    // Add date
    worksheet.mergeCells('A2:I2');
    const dateRow = worksheet.getRow(2);
    dateRow.getCell(1).value = `Fecha de generación: ${this.getFormattedDateTime()}`;
    dateRow.getCell(1).style = { font: { size: 10, italic: true } };
    dateRow.height = 20;

    // Add summary statistics
    const totalValue = data.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStockCount = data.filter(item => item.isLowStock).length;
    worksheet.mergeCells('A3:I3');
    const summaryRow = worksheet.getRow(3);
    summaryRow.getCell(1).value = `Total productos: ${data.length} | Valor total inventario: S/ ${totalValue.toFixed(2)} | Productos con stock bajo: ${lowStockCount}`;
    summaryRow.getCell(1).style = { font: { size: 11, bold: true } };
    summaryRow.height = 20;

    // Add headers
    const headers = ['Producto', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Precio Unitario', 'Valor Total', 'Proveedor', 'Última Actualización', 'Estado'];
    const headerRow = worksheet.getRow(4);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.style = headerStyle;
    });
    headerRow.height = 25;

    // Add data
    data.forEach((stock, index) => {
      const row = worksheet.getRow(5 + index);
      row.getCell(1).value = stock.productName;
      row.getCell(2).value = stock.categoryName;
      row.getCell(3).value = stock.currentStock;
      row.getCell(3).style = { alignment: { horizontal: 'center' } };
      row.getCell(4).value = stock.minStock;
      row.getCell(4).style = { alignment: { horizontal: 'center' } };
      row.getCell(5).value = stock.unitPrice;
      row.getCell(5).numFmt = '#,##0.00';
      row.getCell(6).value = stock.totalValue;
      row.getCell(6).numFmt = '#,##0.00';
      row.getCell(7).value = stock.providerName || '-';
      row.getCell(8).value = stock.lastUpdated;
      row.getCell(9).value = this.getStockStatusLabel(stock.stockStatus);

      // Color based on status
      const statusColor = this.getStockStatusColor(stock.stockStatus);
      row.getCell(9).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: statusColor }
      };
      row.getCell(9).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      row.getCell(9).alignment = { horizontal: 'center' };

      // Alternate row colors
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' }
        };
      }
    });

    // Set column widths
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 15;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 18;
    worksheet.getColumn(6).width = 18;
    worksheet.getColumn(7).width = 25;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 15;

    // Add borders
    this.addBorders(worksheet, 4, 4 + data.length, 1, 9);

    await this.saveWorkbook(workbook, filename);
  }

  /**
   * Exports expiring products report to Excel with advanced formatting.
   * @param data - Array of ExpiringProductReport entities.
   * @param filename - Name of the Excel file (without extension).
   * @param monthFilter - Optional month filter (YYYY-MM format).
   */
  async exportExpiringProductsReport(
    data: ExpiringProductReport[],
    filename: string = 'reporte-productos-por-vencer',
    monthFilter?: string
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Productos por Vencer');

    const headerStyle = this.getHeaderStyle();
    const titleStyle = this.getTitleStyle();

    // Filter by month if provided
    let filteredData = data;
    if (monthFilter) {
      filteredData = data.filter(product => {
        const productMonth = product.expirationDate.substring(0, 7);
        return productMonth === monthFilter;
      });
    }

    // Add title
    worksheet.mergeCells('A1:H1');
    const titleRow = worksheet.getRow(1);
    let titleText = 'REPORTE DE PRODUCTOS POR VENCER';
    if (monthFilter) {
      const monthName = this.getMonthName(monthFilter);
      titleText += ` - ${monthName}`;
    }
    titleRow.getCell(1).value = titleText;
    titleRow.getCell(1).style = titleStyle;
    titleRow.height = 30;

    // Add date
    worksheet.mergeCells('A2:H2');
    const dateRow = worksheet.getRow(2);
    dateRow.getCell(1).value = `Fecha de generación: ${this.getFormattedDateTime()}`;
    dateRow.getCell(1).style = { font: { size: 10, italic: true } };
    dateRow.height = 20;

    // Add summary
    const criticalCount = filteredData.filter(p => p.getExpirationStatus() === 'critical').length;
    const warningCount = filteredData.filter(p => p.getExpirationStatus() === 'warning').length;
    worksheet.mergeCells('A3:H3');
    const summaryRow = worksheet.getRow(3);
    summaryRow.getCell(1).value = `Total productos: ${filteredData.length} | Críticos: ${criticalCount} | Advertencia: ${warningCount}`;
    summaryRow.getCell(1).style = { font: { size: 11, bold: true } };
    summaryRow.height = 20;

    // Add headers
    const headers = ['Producto', 'Categoría', 'Fecha de Vencimiento', 'Días Restantes', 'Stock Actual', 'Lote', 'Proveedor', 'Estado'];
    const headerRow = worksheet.getRow(4);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.style = headerStyle;
    });
    headerRow.height = 25;

    // Add data
    filteredData.forEach((product, index) => {
      const row = worksheet.getRow(5 + index);
      row.getCell(1).value = product.productName;
      row.getCell(2).value = product.categoryName;
      row.getCell(3).value = product.expirationDate;
      const daysLeft = product.getDaysUntilExpiration();
      row.getCell(4).value = daysLeft;
      row.getCell(4).style = { alignment: { horizontal: 'center' } };
      row.getCell(5).value = product.currentStock;
      row.getCell(5).style = { alignment: { horizontal: 'center' } };
      row.getCell(6).value = product.lot || '-';
      row.getCell(7).value = product.providerName || '-';
      row.getCell(8).value = this.getExpirationStatusLabel(product.getExpirationStatus());

      // Color based on status
      const statusColor = this.getExpirationStatusColor(product.getExpirationStatus());
      row.getCell(8).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: statusColor }
      };
      row.getCell(8).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      row.getCell(8).alignment = { horizontal: 'center' };

      // Highlight critical rows
      if (product.getExpirationStatus() === 'critical' || product.getExpirationStatus() === 'expired') {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEBEE' }
        };
      } else if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' }
        };
      }
    });

    // Set column widths
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 18;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 15;
    worksheet.getColumn(7).width = 25;
    worksheet.getColumn(8).width = 15;

    // Add borders
    this.addBorders(worksheet, 4, 4 + filteredData.length, 1, 8);

    await this.saveWorkbook(workbook, filename);
  }

  /**
   * Exports low stock report to Excel with advanced formatting.
   * @param data - Array of LowStockReport entities.
   * @param filename - Name of the Excel file (without extension).
   */
  async exportLowStockReport(data: LowStockReport[], filename: string = 'reporte-stock-bajo'): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stock Bajo');

    const headerStyle = this.getHeaderStyle();
    const titleStyle = this.getTitleStyle();

    // Add title
    worksheet.mergeCells('A1:H1');
    const titleRow = worksheet.getRow(1);
    titleRow.getCell(1).value = 'REPORTE DE PRODUCTOS CON STOCK BAJO';
    titleRow.getCell(1).style = titleStyle;
    titleRow.height = 30;

    // Add date
    worksheet.mergeCells('A2:H2');
    const dateRow = worksheet.getRow(2);
    dateRow.getCell(1).value = `Fecha de generación: ${this.getFormattedDateTime()}`;
    dateRow.getCell(1).style = { font: { size: 10, italic: true } };
    dateRow.height = 20;

    // Add summary
    const criticalCount = data.filter(p => p.getStockStatus() === 'critical').length;
    worksheet.mergeCells('A3:H3');
    const summaryRow = worksheet.getRow(3);
    summaryRow.getCell(1).value = `Total productos: ${data.length} | Críticos (sin stock): ${criticalCount}`;
    summaryRow.getCell(1).style = { font: { size: 11, bold: true } };
    summaryRow.height = 20;

    // Add headers
    const headers = ['Producto', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Diferencia', 'Precio Unitario', 'Proveedor', 'Estado'];
    const headerRow = worksheet.getRow(4);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.style = headerStyle;
    });
    headerRow.height = 25;

    // Add data
    data.forEach((product, index) => {
      const row = worksheet.getRow(5 + index);
      row.getCell(1).value = product.productName;
      row.getCell(2).value = product.categoryName;
      row.getCell(3).value = product.currentStock;
      row.getCell(3).style = { alignment: { horizontal: 'center' } };
      row.getCell(4).value = product.minStock;
      row.getCell(4).style = { alignment: { horizontal: 'center' } };
      row.getCell(5).value = product.stockDifference;
      row.getCell(5).style = { alignment: { horizontal: 'center' }, font: { bold: true, color: { argb: 'FFDC2626' } } };
      row.getCell(6).value = product.unitPrice;
      row.getCell(6).numFmt = '#,##0.00';
      row.getCell(7).value = product.providerName || '-';
      row.getCell(8).value = this.getStockStatusLabel(product.getStockStatus());

      // Color based on status
      const statusColor = this.getStockStatusColor(product.getStockStatus());
      row.getCell(8).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: statusColor }
      };
      row.getCell(8).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      row.getCell(8).alignment = { horizontal: 'center' };

      // Highlight critical rows
      if (product.getStockStatus() === 'critical') {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEBEE' }
        };
      } else if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' }
        };
      }
    });

    // Set column widths
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 15;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 18;
    worksheet.getColumn(7).width = 25;
    worksheet.getColumn(8).width = 15;

    // Add borders
    this.addBorders(worksheet, 4, 4 + data.length, 1, 8);

    await this.saveWorkbook(workbook, filename);
  }

  /**
   * Gets header style for Excel cells.
   */
  private getHeaderStyle(): Partial<ExcelJS.Style> {
    return {
      font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF374151' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    };
  }

  /**
   * Gets title style for Excel cells.
   */
  private getTitleStyle(): Partial<ExcelJS.Style> {
    return {
      font: { bold: true, size: 16, color: { argb: 'FF1F2937' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };
  }

  /**
   * Adds borders to a range of cells.
   */
  private addBorders(worksheet: ExcelJS.Worksheet, startRow: number, endRow: number, startCol: number, endCol: number): void {
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cell = worksheet.getRow(row).getCell(col);
        if (!cell.style) cell.style = {};
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };
      }
    }
  }

  /**
   * Saves the workbook and triggers download.
   */
  private async saveWorkbook(workbook: ExcelJS.Workbook, filename: string): Promise<void> {
    const buffer = await workbook.xlsx.writeBuffer();
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    const link = document.createElement('a');
    const url = URL.createObjectURL(data);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${this.getFormattedDate()}.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Gets formatted date and time string.
   */
  private getFormattedDateTime(): string {
    const date = new Date();
    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Gets formatted date string for filename.
   */
  private getFormattedDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Gets month name from YYYY-MM format.
   */
  private getMonthName(monthFilter: string): string {
    const [year, month] = monthFilter.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('es-PE', { month: 'long', year: 'numeric' });
  }

  /**
   * Gets color code for stock status.
   */
  private getStockStatusColor(status: 'normal' | 'low' | 'critical'): string {
    const colors: Record<string, string> = {
      'normal': 'FF10B981',
      'low': 'FFF59E0B',
      'critical': 'FFEF4444'
    };
    return colors[status] || 'FF6B7280';
  }

  /**
   * Gets color code for expiration status.
   */
  private getExpirationStatusColor(status: 'expired' | 'critical' | 'warning' | 'normal'): string {
    const colors: Record<string, string> = {
      'expired': 'FFDC2626',
      'critical': 'FFEF4444',
      'warning': 'FFF59E0B',
      'normal': 'FF10B981'
    };
    return colors[status] || 'FF6B7280';
  }

  /**
   * Gets Spanish label for stock status.
   */
  private getStockStatusLabel(status: 'normal' | 'low' | 'critical'): string {
    const labels: Record<string, string> = {
      'normal': 'Normal',
      'low': 'Bajo',
      'critical': 'Crítico'
    };
    return labels[status] || status;
  }

  /**
   * Gets Spanish label for expiration status.
   */
  private getExpirationStatusLabel(status: 'expired' | 'critical' | 'warning' | 'normal'): string {
    const labels: Record<string, string> = {
      'expired': 'Vencido',
      'critical': 'Crítico',
      'warning': 'Advertencia',
      'normal': 'Normal'
    };
    return labels[status] || status;
  }
}
