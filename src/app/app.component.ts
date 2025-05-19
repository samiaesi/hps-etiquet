import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  data: any[] = [];
  currentDate: Date | undefined = new Date();
  selectedItems: any[] = [];
  searchQuery: string = '';
  filteredData: any[] = [];
  nombreProfiles: number | null = null;

  clientName: string = 'Hasnaoui Profile Systems';
  clientAddress: string = 'B.P 245 zone industrielle Sidi Bel Abbes';
  clientPostalCode: string = '22000 Sidi bel abbes';
  clientPhone: string = '+213 (0) 48 70 66 19';
  clientWebsite: string = 'https://www.hps-dz.com';

  fournisseurName: string = ''; // Champ pour le nom du fournisseur

  displayedColumns: string[] = [
    'systeme',
    'image',
    'reference',
    'finition',
    'designation',
    'quantite',
    'nombre',
    'select'
  ];

  constructor(private firestore: AngularFirestore) {}

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const bstr = e.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        this.data = XLSX.utils.sheet_to_json(worksheet);

        this.data = this.data.map(item => ({ ...item, nombre: 1 }));
        this.filteredData = this.data;
        this.saveDataToFirebase(this.data);
      };
      reader.readAsBinaryString(file);
    }
  }

  saveDataToFirebase(data: any[]): void {
    data.forEach(item => {
      this.firestore.collection('accessoires').add(item);
    });
  }

  toggleSelection(item: any): void {
    if (this.selectedItems.includes(item)) {
      this.selectedItems = this.selectedItems.filter(i => i !== item);
    } else {
      this.selectedItems.push(item);
    }
  }

  generatePDF(): void {
    let y = 10;

    const doc = new jsPDF({
      unit: 'mm',
      format: [150, 100],
    });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(this.clientName, 10, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(this.clientAddress, 10, y);
    y += 5;
    doc.text(`Code Postal: ${this.clientPostalCode}`, 10, y);
    y += 5;
    doc.text(`Téléphone: ${this.clientPhone}`, 10, y);
    y += 5;
    doc.text(`Site Web: ${this.clientWebsite}`, 10, y);
    y += 8;

    // Affichage du nom du fournisseur
    if (this.fournisseurName.trim() !== '') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`Fournisseur : ${this.fournisseurName}`, 10, y);
      y += 6;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Liste des articles', 10, y);
    y += 5;

    if (this.nombreProfiles !== null) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Nombre de profils : ${this.nombreProfiles}`, 10, y);
      y += 7;
    }

    const tableColumns = ['#', 'Article', 'Référence', 'Finition', 'Quantité', 'Nombre'];
    const tableRows = this.selectedItems.map((item, i) => [
      `${i + 1}`,
      item["Désignation"] || '',
      item["Référence"] || '',
      item["Finition"] || '',
      item["Quantité"] || '',
      item["nombre"] || 1,
    ]);

    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: y,
      styles: {
        fontSize: 8,
        cellPadding: 1,
        textColor: 20,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 20,
        fontStyle: 'bold',
        lineWidth: 0.1,
        lineColor: 20,
      },
      theme: 'grid',
      margin: { left: 10, right: 10 },
    });

    const currentDate = new Date().toLocaleDateString('fr-FR');
    const finalY = (doc as any).lastAutoTable?.finalY || y + 10;
    const pageHeight = doc.internal.pageSize.height;
    const footerY = pageHeight - 20;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Date : ${currentDate}`, 10, footerY);

    doc.setFontSize(8);
    const footerText = "Ce document représente la liste de colisage des articles.";
    doc.text(doc.splitTextToSize(footerText, 230), 10, footerY + 6);

    doc.save('profiles-selectionnes.pdf');
  }

  onDragStart(event: any, item: any): void {
    event.dataTransfer.setData('item', JSON.stringify(item));
  }

  onDrop(event: any): void {
    event.preventDefault();
    const itemData = event.dataTransfer.getData('item');
    const item = JSON.parse(itemData);
    if (!this.selectedItems.includes(item)) {
      this.selectedItems.push(item);
    }
  }

  onDragOver(event: any): void {
    event.preventDefault();
  }

  filterDataByReference(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredData = this.data;
    } else {
      this.filteredData = this.data.filter(item =>
        item['Référence']?.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }
}
