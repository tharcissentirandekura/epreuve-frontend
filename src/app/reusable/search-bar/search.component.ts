import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api/api.service';

@Component({
	selector: 'app-search-bar',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './search.component.html',
	styleUrl: './search.component.scss',

})
export class SearchBarComponent implements OnInit {
	// Using a Subject to manage the unsubscribe logic
	private searchSubject = new Subject<string>();
	private destroy$ = new Subject<void>();
	isLoggedIn: boolean = false;
	isSearchBarVisible: boolean = false;
	searchQuery: string = '';
	searchResults: any[] = [];
    categories: string[] = ['BCSCT', 'LANGUE', 'Maths', 'Physique', 'Chimie', 'Biologie'];
    selectedCategory: string = '';
	isFeatureOn: boolean = false;

	constructor(
		private apiService: ApiService
	) {}

	ngOnInit(): void {

		// Set up the search subject to handle search input changes
		this.searchSubject.pipe(
			debounceTime(400), // Wait for 300ms after the last keystroke
			distinctUntilChanged(), // Only emit if the value has changed
			takeUntil(this.destroy$) // Automatically unsubscribe when the component is destroyed
		).subscribe((query: string) => {
			if (query){
				this.searchTests(query);
			}else{
				this.searchResults = [];
			}
		}
		)
	}

	/**
	 * Chat bot or view online tests
	 * 
	 *
	 */
	useChatBot(result: any) {
		console.log("Utilization de l'intelligence artificiel", result);
	}
	viewOnline(result: any) {
		console.log("View online tests", result);
		// Navigate to the test link
		if (result && result.url) {
			window.open(result.url, '_blank');
		} else {
			console.error('Invalid test link:', result);
		}
	}

	/**
	 *
	 * @param event
	 * The part for handling search filtering based on user input query
	 */
	//search
	toggleSearchBar(event: Event) {
		event.preventDefault();
		this.isSearchBarVisible = !this.isSearchBarVisible;
		if (!this.isSearchBarVisible) {
			//clear search query when closing the search bar
			this.searchQuery = '';
			//clear search results when closing the search bar
			this.searchResults = [];
		}
	}

	onSearch() {
		const query = this.searchQuery.trim();
		this.searchSubject.next(query); // Emit the search query to the subject
	}


    //filter by category choosen by user after general search
    filterByCategory(category: string) {
        
        this.selectedCategory =  this.selectedCategory === category ? '' : category.toLocaleLowerCase(); // determine if toggle selection or not
        if (this.searchQuery) {
            this.onSearch(); // Trigger search if there is a query
        }
    }

	// normalize the test name
	normalizeCourseName(test:any): string {
		const type = test.metadata.type ? test.metadata.type : '';
		// const section = test.section ? test.section : '';
		const course = test.course ? test.course : '';
		const year = test.year ? ` ${new Date(test.year).getFullYear()}` : '';
		return `${type} de  ${course} année ${year}`.trim();
	}
	//get all tests
	searchTests(query: string) {
		const endpoint = 'tests';
		const trimmedQuery = query.trim().toLowerCase();

		if (trimmedQuery) {
			this.apiService.getTestByCategory(endpoint, trimmedQuery).subscribe({
				next: (response) => {
                    let filteredResults = response.results
                        .filter((epreuve:any) => 
                            epreuve.test.toLowerCase().includes(trimmedQuery));
                    //apply category filter if selected
                    if (this.selectedCategory) {
                        filteredResults = filteredResults.filter((epreuve:any) =>
                            epreuve.category.toLowerCase().includes(this.selectedCategory.toLowerCase())
                        );
                    }

                    console.log('Filtered search results:', filteredResults);
                    console.log('Selected catefories:', this.selectedCategory);

                    this.searchResults = filteredResults.map((epreuve: any) => ({
                        name: this.normalizeCourseName(epreuve),
                        url: epreuve.link,
						metadata:epreuve.metadata
                    }));

				},
				error: (error) => {
					console.log('Error happened filtering search:', error);
					this.searchResults = [];
				},
			});
		} else {
			this.searchResults = [];
		}
	}
}
