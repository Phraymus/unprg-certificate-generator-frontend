import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCard, MatCardContent } from "@angular/material/card";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-inscripcion-exitosa',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatCardContent,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="success-page-container">
      <mat-card class="success-card">
        <mat-card-content>
          <div class="success-content">
            <div class="success-animation">
              <mat-icon class="success-icon">check_circle</mat-icon>
            </div>

            <h1>¡Inscripción Exitosa!</h1>

            <p class="success-message">
              Su inscripción ha sido registrada correctamente y está en estado <strong>PENDIENTE</strong>.
            </p>

            <div class="info-box">
              <mat-icon class="info-icon">info</mat-icon>
              <div class="info-content">
                <h3>Próximos pasos:</h3>
                <ol>
                  <li>Recibirá un correo de confirmación en los próximos minutos</li>
                  <li>El administrador revisará su solicitud de inscripción</li>
                  <li>Una vez aprobada, recibirá una notificación por correo</li>
                  <li>Podrá descargar su certificado de participación cuando el evento finalice</li>
                </ol>
              </div>
            </div>

            <div class="contact-box">
              <mat-icon>contact_support</mat-icon>
              <div>
                <h4>¿Tiene alguna pregunta?</h4>
                <p>Puede contactarnos en: <a href="mailto:soporte@unprg.edu.pe">mail</a></p>
              </div>
            </div>

            <div class="action-buttons">
              <button mat-raised-button color="primary" (click)="volverInicio()">
                <mat-icon>home</mat-icon>
                Volver al Inicio
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .success-page-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0052A3 0%, #003D7A 100%);
      padding: 2rem 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .success-card {
      max-width: 700px;
      width: 100%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      border-radius: 16px;
    }

    .success-content {
      padding: 3rem 2rem;
      text-align: center;
    }

    .success-animation {
      margin-bottom: 2rem;
      animation: scaleIn 0.5s ease-out;
    }

    @keyframes scaleIn {
      from {
        transform: scale(0);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .success-icon {
      font-size: 100px;
      width: 100px;
      height: 100px;
      color: #4caf50;
      filter: drop-shadow(0 4px 8px rgba(76, 175, 80, 0.3));
    }

    h1 {
      color: #2d3748;
      font-size: 2.5rem;
      margin: 1rem 0;
      font-weight: 600;
    }

    .success-message {
      font-size: 1.2rem;
      color: #4a5568;
      margin: 1.5rem 0 2rem;
      line-height: 1.6;
    }

    .info-box {
      background: linear-gradient(135deg, #E8F4F8 0%, #D1E7F0 100%);
      border-radius: 12px;
      padding: 2rem;
      text-align: left;
      margin: 2rem 0;
      display: flex;
      gap: 1.5rem;

      .info-icon {
        flex-shrink: 0;
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: #0052A3;
      }

      .info-content {
        flex: 1;

        h3 {
          color: #003D7A;
          margin: 0 0 1rem;
          font-size: 1.3rem;
        }

        ol {
          margin: 0;
          padding-left: 1.5rem;
          color: #0052A3;

          li {
            margin-bottom: 0.75rem;
            line-height: 1.6;

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }

    .contact-box {
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      text-align: left;
      margin: 2rem 0;

      mat-icon {
        flex-shrink: 0;
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #0052A3;
      }

      h4 {
        margin: 0 0 0.5rem;
        color: #2d3748;
        font-size: 1.1rem;
      }

      p {
        margin: 0;
        color: #4a5568;

        a {
          color: #0052A3;
          text-decoration: none;
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .action-buttons {
      margin-top: 2rem;

      button {
        min-width: 200px;
        height: 48px;
        font-size: 1rem;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: linear-gradient(135deg, #0052A3 0%, #003D7A 100%);

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 82, 163, 0.4);
        }

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }
    }

    @media (max-width: 768px) {
      .success-content {
        padding: 2rem 1rem;
      }

      h1 {
        font-size: 1.8rem;
      }

      .success-message {
        font-size: 1rem;
      }

      .info-box {
        flex-direction: column;
        text-align: center;

        .info-icon {
          margin: 0 auto;
        }

        .info-content {
          text-align: left;
        }
      }

      .contact-box {
        flex-direction: column;
        text-align: center;

        mat-icon {
          margin: 0 auto;
        }
      }

      .action-buttons button {
        width: 100%;
      }
    }
  `]
})
export class InscripcionExitosaComponent implements OnInit {
  private _route: ActivatedRoute = inject(ActivatedRoute);
  private _router: Router = inject(Router);

  eventoId: number | null = null;

  ngOnInit() {
    this._route.queryParams.subscribe(params => {
      this.eventoId = params['eventoId'] ? +params['eventoId'] : null;
    });
  }

  volverInicio() {
    this._router.navigate(['/']);
  }
}
