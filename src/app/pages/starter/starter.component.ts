import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {CommonModule, NgForOf, NgIf} from '@angular/common';
import { MaterialModule } from '../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

import { TbEvento, TbParticipante, TbCertificado } from '~shared/interfaces';
import { forkJoin } from 'rxjs';
import {AppBlogCardsComponent} from "app/components/blog-card/blog-card.component";
import {AppSalesProfitComponent} from "app/components/sales-profit/sales-profit.component";
import {AppTotalFollowersComponent} from "app/components/total-followers/total-followers.component";
import {AppTotalIncomeComponent} from "app/components/total-income/total-income.component";
import {AppPopularProductsComponent} from "app/components/popular-products/popular-products.component";
import {AppEarningReportsComponent} from "app/components/earning-reports/earning-reports.component";
import {
  TbCertificadoService,
  TbCertificateService,
  TbEventoService,
  TbFormatoCertificadoService,
  TbParticipanteService
} from "app/services";

interface DashboardStats {
  totalEventos: number;
  totalParticipantes: number;
  totalCertificados: number;
  totalFormatos: number;
}

interface RecentEvent {
  id: number;
  codigo: string;
  nombre: string;
  fecha: string;
  participantes: number;
}

@Component({
  selector: 'app-starter',
  imports: [
    MaterialModule,
    TablerIconsModule,
    NgIf,
    NgForOf,
  ],
  templateUrl: './starter.component.html',
  styleUrls: ['starter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StarterComponent implements OnInit {
  stats: DashboardStats = {
    totalEventos: 0,
    totalParticipantes: 0,
    totalCertificados: 0,
    totalFormatos: 0
  };

  recentEvents: RecentEvent[] = [];
  recentParticipants: TbParticipante[] = [];
  loading = true;

  // Stats cards configuration
  statsCards = [
    {
      id: 'eventos',
      title: 'Total Eventos',
      icon: 'solar:calendar-bold-duotone',
      color: 'primary',
      value: 0
    },
    {
      id: 'participantes',
      title: 'Total Participantes',
      icon: 'solar:users-group-rounded-bold-duotone',
      color: 'success',
      value: 0
    },
    {
      id: 'certificados',
      title: 'Certificados Generados',
      icon: 'solar:document-text-bold-duotone',
      color: 'warning',
      value: 0
    },
    {
      id: 'formatos',
      title: 'Formatos Disponibles',
      icon: 'solar:document-bold-duotone',
      color: 'error',
      value: 0
    }
  ];

  constructor(
    private eventoService: TbEventoService,
    private participanteService: TbParticipanteService,
    private certificadoService: TbCertificadoService,
    private formatoService: TbFormatoCertificadoService,
    private certificateService: TbCertificateService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    forkJoin({
      eventos: this.eventoService.findAll(),
      participantes: this.participanteService.findAll(),
      certificados: this.certificadoService.findAll(),
      formatos: this.formatoService.findAll()
    }).subscribe({
      next: (data: any) => {
        // Update stats
        this.stats.totalEventos = data.eventos?.length || 0;
        this.stats.totalParticipantes = data.participantes?.length || 0;
        this.stats.totalCertificados = data.certificados?.length || 0;
        this.stats.totalFormatos = data.formatos?.length || 0;

        // Update stats cards
        this.statsCards[0].value = this.stats.totalEventos;
        this.statsCards[1].value = this.stats.totalParticipantes;
        this.statsCards[2].value = this.stats.totalCertificados;
        this.statsCards[3].value = this.stats.totalFormatos;

        // Process recent events
        if (data.eventos && data.eventos.length > 0) {
          this.processRecentEvents(data.eventos);
        }

        // Get recent participants
        if (data.participantes && data.participantes.length > 0) {
          this.recentParticipants = data.participantes.slice(0, 5);
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  processRecentEvents(eventos: TbEvento[]): void {
    // Sort by date (most recent first) and take top 5
    const sortedEventos = [...eventos]
      .sort((a, b) => {
        const dateA = new Date(a.fechaInicio || '').getTime();
        const dateB = new Date(b.fechaInicio || '').getTime();
        return dateB - dateA;
      })
      .slice(0, 5);

    // For each event, get participant count
    sortedEventos.forEach(evento => {
      this.participanteService.findAllByIdEvento(evento.id!).subscribe({
        next: (participantes: any) => {
          this.recentEvents.push({
            id: evento.id!,
            codigo: evento.codigo || 'N/A',
            nombre: evento.nombre || 'Sin nombre',
            fecha: this.formatDate(evento.fechaInicio || ''),
            participantes: participantes?.length || 0
          });
        },
        error: (error) => {
          console.error(`Error loading participants for event ${evento.id}:`, error);
        }
      });
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  downloadCertificate(eventoId: number, personaId: number): void {
    this.certificateService.downloadCertificate(eventoId, personaId)
      .then(() => {
        console.log('Certificate downloaded successfully');
      })
      .catch((error) => {
        console.error('Error downloading certificate:', error);
      });
  }

  getInitials(nombre: string): string {
    if (!nombre) return 'NA';
    const words = nombre.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  navigateToEventDetails(eventoId: number): void {
    // TODO: Implement navigation to event details
    console.log('Navigate to event:', eventoId);
  }
}
