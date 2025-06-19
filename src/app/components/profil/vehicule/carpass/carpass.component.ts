import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface CarPassEntry {
  date: string;
  kilometrage: number;
  occasion: string;
}

@Component({
  selector: 'app-carpass',
  templateUrl: './carpass.component.html',
  styleUrls: ['./carpass.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class CarpassComponent implements OnInit {
  carPassForm: FormGroup;
  carPassHistory: CarPassEntry[] = [];
  loadingHistory = false;

  constructor(private fb: FormBuilder) {
    this.carPassForm = this.fb.group({
      kilometrage: ['', [Validators.required, Validators.min(0)]],
      occasion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCarPassHistory();
  }

  loadCarPassHistory(): void {
    this.loadingHistory = true;
    // Simulation de données, à remplacer par un appel API réel
    setTimeout(() => {
      this.carPassHistory = [
        { date: '2024-03-20', kilometrage: 15000, occasion: 'Vidange annuelle' },
        { date: '2024-02-15', kilometrage: 14500, occasion: 'Contrôle technique' },
        { date: '2024-01-10', kilometrage: 14000, occasion: 'Révision périodique' }
      ];
      this.loadingHistory = false;
    }, 500);
  }

  submitCarPass(): void {
    if (this.carPassForm.valid) {
      // À remplacer par un appel API réel
      const newEntry = {
        date: new Date().toISOString().slice(0, 10),
        ...this.carPassForm.value
      };
      this.carPassHistory.unshift(newEntry);
      this.carPassForm.reset();
    }
  }
}
