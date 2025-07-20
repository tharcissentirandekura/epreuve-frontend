import { Component, OnInit} from '@angular/core';
import { NavbarComponent } from '../../reusable/navbar/navbar.component';
import { FooterComponent } from '../../reusable/footer/footer.component';
import { CommonModule } from '@angular/common';
import { FaqService } from '../../services/faq/faq.service';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { FAQ } from '../../models/faq';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-help-form',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './help-form.component.html',
  styleUrl: './help-form.component.scss'
})
export class HelpFormComponent implements OnInit {

  faqs: FAQ[] = [];
  filteredFaqs: FAQ[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  searchTerm: string = '';
  private searchTerms = new Subject<string>();

  constructor(
    private faqService: FaqService,
    private router:    Router
  ) {}

  goToContact() {
    this.router.navigate(['/contact']);
  }

  ngOnInit(): void {
    this.loadFaqs();
    this.loadCategories();
    
    // Setup search with debounce
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => 
        this.faqService.searchFaqs(term))
    ).subscribe(results => {
      this.filteredFaqs = this.selectedCategory 
        ? results.filter(faq => faq.category === this.selectedCategory)
        : results;
    });
    
    // // Load Bootstrap JS for accordion functionality
    // this.loadBootstrapJs();
  }

  loadFaqs(): void {
    this.faqService.getAllFaqs().subscribe(faqs => {
      this.faqs = faqs;
      this.filteredFaqs = faqs;
    });
  }

  loadCategories(): void {
    this.faqService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    
    if (category) {
      this.faqService.getFaqsByCategory(category).subscribe(faqs => {
        this.filteredFaqs = this.searchTerm 
          ? faqs.filter(faq => 
              faq.question.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
              faq.answer.toLowerCase().includes(this.searchTerm.toLowerCase()))
          : faqs;
      });
    } else {
      this.faqService.searchFaqs(this.searchTerm).subscribe(faqs => {
        this.filteredFaqs = faqs;
      });
    }
  }

  search(): void {
    this.searchTerms.next(this.searchTerm.trim().toLowerCase()); 
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.loadFaqs();
  }

  // loadBootstrapJs(): void {
  //   // Dynamically load Bootstrap JS
  //   // const script = document.createElement('script');
  //   // script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
  //   // script.integrity = 'sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz';
  //   // script.crossOrigin = 'anonymous';
  //   // document.body.appendChild(script);
  // }

}
