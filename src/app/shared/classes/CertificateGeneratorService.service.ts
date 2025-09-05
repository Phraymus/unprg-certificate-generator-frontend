import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface CertificateData {
  evento: {
    codigo: string;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
  };
  participante: {
    dni: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    email: string;
    telefono: string;
    estado: string;
    fechaInscripcion: string;
    nota: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CertificateGeneratorService {

  constructor() {}

  async generateCertificate(data: CertificateData): Promise<void> {
    // Crear nuevo documento PDF en formato landscape A4
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Dimensiones del documento
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    try {
      // Dibujar el certificado
      this.drawCertificate(pdf, data, pageWidth, pageHeight);

      // Generar nombre del archivo
      const fileName = `certificado_${data.participante.dni}_${data.evento.codigo}_${new Date().toISOString().split('T')[0]}.pdf`;

      // Descargar el PDF
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generando certificado:', error);
      throw new Error('Error al generar el certificado');
    }
  }

  private drawCertificate(pdf: jsPDF, data: CertificateData, pageWidth: number, pageHeight: number): void {
    // Colores
    const blueColor = '#1e4a72';
    const lightBlue = '#4a90e2';

    // Dibujar bordes
    this.drawBorders(pdf, pageWidth, pageHeight, blueColor);

    // Dibujar franja lateral azul
    pdf.setFillColor(blueColor);
    pdf.rect(5, 5, 50, pageHeight - 10, 'F');

    // Logo UNPRG (placeholder - aquí irían los logos reales)
    this.drawLogos(pdf, blueColor, pageWidth, lightBlue);

    // Título de la universidad
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold', 18);
    pdf.text('UNIVERSIDAD NACIONAL PEDRO RUIZ GALLO', pageWidth / 2, 35, { align: 'center' });

    pdf.setFont('helvetica', 'normal', 14);
    pdf.text('ESCUELA PROFESIONAL DE INGENIERÍA DE SISTEMAS', pageWidth / 2, 45, { align: 'center' });

    // Título CERTIFICADO
    pdf.setFont('helvetica', 'bold', 36);
    pdf.text('CERTIFICADO', pageWidth / 2, 70, { align: 'center' });

    // OTORGADO A
    pdf.setFont('helvetica', 'normal', 16);
    pdf.text('OTORGADO A:', pageWidth / 2, 85, { align: 'center' });

    // Nombre del participante
    const nombreCompleto = this.fixEncoding(`${data.participante.nombres} ${data.participante.apellidoPaterno} ${data.participante.apellidoMaterno}`);
    pdf.setFont('helvetica', 'bold', 24);
    pdf.setTextColor(blueColor);
    pdf.text(nombreCompleto, pageWidth / 2, 105, { align: 'center' });

    // Texto de participación
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal', 12);

    const participacionTexto = 'Por su participación en calidad de ASISTENTE, con 9 horas de participación';
    pdf.text(participacionTexto, pageWidth / 2, 125, { align: 'center' });

    // Nombre del evento
    const eventoTexto = `en el "${data.evento.nombre}", realizado el ${this.formatDate(data.evento.fechaInicio)} del ${this.getYear(data.evento.fechaInicio)}, donde`;
    pdf.text(eventoTexto, pageWidth / 2, 135, { align: 'center' });

    const temasTexto = 'se abordaron temas de Auditoría de TI, Gobierno de TI y Seguridad';
    pdf.text(temasTexto, pageWidth / 2, 145, { align: 'center' });

    const informaticaTexto = 'Informática.';
    pdf.text(informaticaTexto, pageWidth / 2, 155, { align: 'center' });

    // Firmas
    this.drawSignatures(pdf, pageWidth, pageHeight);

    // Información adicional del participante (pequeña, en esquina)
    this.drawParticipantInfo(pdf, data, pageWidth, pageHeight);
  }

  private drawBorders(pdf: jsPDF, pageWidth: number, pageHeight: number, color: string): void {
    pdf.setDrawColor(color);
    pdf.setLineWidth(1);
    pdf.rect(5, 5, pageWidth - 10, pageHeight - 10);

    pdf.setLineWidth(0.5);
    pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);
  }

  private drawLogos(pdf: jsPDF, color: string, pageWidth: number, lightBlue: string): void {
    // Logo UNPRG (círculo placeholder)
    pdf.setFillColor(255, 255, 255);
    pdf.circle(30, 35, 15, 'F');
    pdf.setDrawColor(color);
    pdf.circle(30, 35, 15);

    pdf.setTextColor(color);
    pdf.setFont('helvetica', 'normal', 8);
    pdf.text('UNPRG', 30, 38, { align: 'center' });

    // Logo ISACA (placeholder)
    pdf.setFillColor(lightBlue);
    pdf.rect(pageWidth - 80, 20, 60, 30, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold', 12);
    pdf.text('ISACA', pageWidth - 50, 35, { align: 'center' });
    pdf.setFont('helvetica', 'normal', 8);
    pdf.text('UNPRG Student Group', pageWidth - 50, 42, { align: 'center' });
  }

  private drawSignatures(pdf: jsPDF, pageWidth: number, pageHeight: number): void {
    const y = pageHeight - 60;
    const signature1X = pageWidth * 0.25;
    const signature2X = pageWidth * 0.5;
    const signature3X = pageWidth * 0.75;

    // Líneas para firmas
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(0, 0, 0);

    // Firma 1
    pdf.line(signature1X - 40, y, signature1X + 40, y);
    pdf.setFont('helvetica', 'bold', 10);
    pdf.text('Dr. ALBERTO ENRIQUE', signature1X, y + 8, { align: 'center' });
    pdf.text('SAMILLAN AYALA', signature1X, y + 15, { align: 'center' });
    pdf.setFont('helvetica', 'normal', 8);
    pdf.text('Director de la Escuela Profesional de', signature1X, y + 22, { align: 'center' });
    pdf.text('Ingeniería de Sistemas - UNPRG', signature1X, y + 28, { align: 'center' });

    // Firma 2
    pdf.line(signature2X - 40, y, signature2X + 40, y);
    pdf.setFont('helvetica', 'bold', 10);
    pdf.text('Mtr. LUIS ALBERTO OTAKE', signature2X, y + 8, { align: 'center' });
    pdf.text('OYAMA', signature2X, y + 15, { align: 'center' });
    pdf.setFont('helvetica', 'normal', 8);
    pdf.text('ISACA Academic Advocate', signature2X, y + 22, { align: 'center' });

    // Firma 3
    pdf.line(signature3X - 40, y, signature3X + 40, y);
    pdf.setFont('helvetica', 'bold', 10);
    pdf.text('CARRASCO OCAÑA BRAYAN', signature3X, y + 8, { align: 'center' });
    pdf.text('DANIEL', signature3X, y + 15, { align: 'center' });
    pdf.setFont('helvetica', 'normal', 8);
    pdf.text('Presidente de UNPRG ISACA', signature3X, y + 22, { align: 'center' });
    pdf.text('Student Group', signature3X, y + 28, { align: 'center' });
  }

  private drawParticipantInfo(pdf: jsPDF, data: CertificateData, pageWidth: number, pageHeight: number): void {
    // Posicionar en la esquina inferior derecha, fuera del área de firmas
    pdf.setFont('helvetica', 'normal', 8);
    pdf.setTextColor(80, 80, 80);

    const x = pageWidth - 65;
    const y = pageHeight - 25;

    pdf.text(`DNI: ${data.participante.dni}`, x, y);
    pdf.text(`Código: ${data.evento.codigo}`, x, y + 5);
    pdf.text(`Nota: ${data.participante.nota}/20`, x, y + 10);
    pdf.text(`Fecha: ${new Date().toLocaleDateString('es-PE')}`, x, y + 15);
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    return `${date.getDate()} de ${months[date.getMonth()]}`;
  }

  private getYear(dateString: string): string {
    return new Date(dateString).getFullYear().toString();
  }

  // Método para corregir caracteres especiales en nombres
  private fixEncoding(text: string): string {
    return text
      .replace(/Ã©/g, 'é')
      .replace(/Ã¡/g, 'á')
      .replace(/Ã­/g, 'í')
      .replace(/Ã³/g, 'ó')
      .replace(/Ãº/g, 'ú')
      .replace(/Ã±/g, 'ñ')
      .replace(/Ã/g, 'Á')
      .replace(/Ã‰/g, 'É')
      .replace(/Ã/g, 'Í')
      .replace(/Ã"/g, 'Ó')
      .replace(/Ãš/g, 'Ú')
      .replace(/Ã'/g, 'Ñ');
  }

  // Método público para generar certificado desde componente
  async generateCertificateFromParticipant(participanteData: any): Promise<void> {
    // Corregir encoding de nombres
    const data: CertificateData = {
      evento: participanteData.evento,
      participante: {
        ...participanteData.participante,
        nombres: this.fixEncoding(participanteData.participante.nombres),
        apellidoPaterno: this.fixEncoding(participanteData.participante.apellidoPaterno),
        apellidoMaterno: this.fixEncoding(participanteData.participante.apellidoMaterno)
      }
    };

    await this.generateCertificate(data);
  }
}
