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
  clientAddress: string = 'B.P 245 zone industrielle sba';
  clientPostalCode: string = '22000 Sidi bel abbes';
  clientPhone: string = '+213 (0) 48 70 66 19';
  clientWebsite: string = 'https://www.hps-dz.com';

  // Ajout de la colonne 'nombre'
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

        // Initialise chaque item avec nombre = 1
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
      format: [250, 150],
    });

// === En-tête client ===
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

// === Préparer les données pour le tableau ===
    const tableColumns = ['#', 'Article', 'Référence', 'Finition', 'Quantité', 'Nombre'];
    const tableRows = this.selectedItems.map((item, i) => [
      `${i + 1}`,
      item["Désignation"] || '',
      item["Référence"] || '',
      item["Finition"] || '',
      item["Quantité"] || '',
      item["nombre"] || 1,
    ]);

// === Insérer le tableau avec autoTable ===
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: y,
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: { fillColor: [200, 200, 200] },
      margin: { left: 10, right: 10 },
      theme: 'grid',
    });

// === Ajouter la date et le footer à la fin ===
    let finalY = 0;

    if ((doc as any).lastAutoTable?.finalY) {
      finalY = (doc as any).lastAutoTable.finalY + 10;
    } else {
      finalY = y + 10; // Fallback si la table n'a pas été générée
    }


    const currentDate = new Date().toLocaleDateString('fr-FR');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Date : ${currentDate}`, 10, finalY);
    finalY += 6;

    doc.setFontSize(8);
    const footerText =
      "Ce document représente la liste de colisage des articles sélectionnés. " +
      "Il est fourni à titre informatif et ne constitue pas un bon de livraison officiel.";

    doc.text(doc.splitTextToSize(footerText, 80), 10, finalY);

// === Sauvegarder le PDF ===
    doc.save('profiles-selectionnes.pdf');
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
