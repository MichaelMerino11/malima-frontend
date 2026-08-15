import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const useExportar = () => {
  const exportarExcel = (datos: any[], nombreArchivo: string, nombreHoja = 'Datos') => {
    const ws = XLSX.utils.json_to_sheet(datos)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja)
    XLSX.writeFile(wb, `${nombreArchivo}.xlsx`)
  }

  const exportarPDF = (titulo: string, headers: string[], rows: any[][], nombreArchivo: string) => {
    const doc = new jsPDF()

    // Logo/título
    doc.setFontSize(16)
    doc.setTextColor(26, 58, 143)
    doc.text('Grupo Malima', 14, 16)

    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text('Sistema de Automatización de Invernaderos', 14, 23)

    doc.setFontSize(13)
    doc.setTextColor(26, 58, 143)
    doc.text(titulo, 14, 34)

    doc.setFontSize(9)
    doc.setTextColor(150)
    doc.text(`Generado: ${new Date().toLocaleString('es-EC', { hour12: false })}`, 14, 40)

    autoTable(doc, {
      startY: 46,
      head: [headers],
      body: rows,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [26, 58, 143], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 },
    })

    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text('Desarrollado por Maintronic', 14, doc.internal.pageSize.height - 10)

    doc.save(`${nombreArchivo}.pdf`)
  }

  return { exportarExcel, exportarPDF }
}
