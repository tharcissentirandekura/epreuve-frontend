import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class SearchBarComponent implements OnInit, OnDestroy {
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
	isSearching: boolean = false;
	searchError: string | null = null;

	constructor(
		private apiService: ApiService
	) {}

	ngOnInit(): void {
		// Set up the search subject to handle search input changes
		this.searchSubject.pipe(
			debounceTime(400), // Wait for 400ms after the last keystroke
			distinctUntilChanged(), // Only emit if the value has changed
			takeUntil(this.destroy$) // Automatically unsubscribe when the component is destroyed
		).subscribe((query: string) => {
			if (query){
				this.searchTests(query);
			}else{
				this.searchResults = [];
			}
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
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
			//clear error and loading state
			this.searchError = null;
			this.isSearching = false;
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
	normalizeCourseName(test: any): string {
		console.log("Tests:", test)
		if (!test) return 'Test inconnu';
		return test.test || 'Test sans nom';
	}
	//get all tests
	searchTests(query: string) {
		const endpoint = 'tests';
		const trimmedQuery = query.trim().toLowerCase();

		if (trimmedQuery) {
			this.isSearching = true;
			this.searchError = null;
			
			this.apiService.getTestByCategory(endpoint, trimmedQuery).subscribe({
				next: (response) => {
					this.isSearching = false;
					
					// Handle different response structures
					let results: any[] = [];
					
					// Check if response has results property (ApiResponse structure)
					if (response && response.results && Array.isArray(response.results)) {
						results = response.results;
					} 
					// Check if response is directly an array
					else if (Array.isArray(response)) {
						results = response;
					}
					// If neither, log and return empty
					else {
						console.warn('Unexpected API response structure:', response);
						this.searchResults = [];
						this.searchError = 'Format de réponse inattendu du serveur';
						return;
					}

					// Filter results by search query (backend may already filter, but we do client-side too for safety)
					let filteredResults = results.filter((epreuve: any) => {
						if (!epreuve) return false;
						// Check multiple fields for search matching
						const testMatch = epreuve.test?.toLowerCase().includes(trimmedQuery) || false;
						const courseMatch = epreuve.course?.toLowerCase().includes(trimmedQuery) || false;
						const sectionMatch = epreuve.section?.toLowerCase().includes(trimmedQuery) || false;
						return testMatch || courseMatch || sectionMatch;
					});

					// Apply category filter if selected
					if (this.selectedCategory) {
						filteredResults = filteredResults.filter((epreuve: any) => {
							if (!epreuve) return false;
							// Check category in multiple possible locations
							const category = epreuve.category?.toLowerCase() || 
											epreuve.metadata?.category?.toLowerCase() || 
											epreuve.section?.toLowerCase() || '';
							return category.includes(this.selectedCategory.toLowerCase());
						});
					}

					console.log('Filtered search results:', filteredResults);
					console.log('Selected categories:', this.selectedCategory);
					console.log('Total results:', filteredResults.length);

					// Map results to display format
					this.searchResults = filteredResults.map((epreuve: any) => ({
						name: this.normalizeCourseName(epreuve),
						url: epreuve.link || epreuve.url || '#',
						metadata: epreuve.metadata || {
							section: epreuve.section || '',
							course: epreuve.course || '',
							type: epreuve.metadata?.type || ''
						}
					}));

					// Clear error if we have results
					if (this.searchResults.length === 0) {
						this.searchError = 'Aucun résultat trouvé pour votre recherche';
					}
				},
				error: (error) => {
					this.isSearching = false;
					console.error('Error happened filtering search:', error);
					
					// Provide user-friendly error messages
					if (error.status === 401 || error.status === 403) {
						this.searchError = 'Authentification requise pour effectuer une recherche';
					} else if (error.status === 404) {
						this.searchError = 'Endpoint de recherche introuvable';
					} else if (error.status === 0 || error.status >= 500) {
						this.searchError = 'Erreur serveur. Veuillez réessayer plus tard';
					} else if (error.message?.includes('No valid authentication tokens')) {
						this.searchError = 'Session expirée. Veuillez vous reconnecter';
					} else {
						this.searchError = 'Erreur lors de la recherche. Veuillez réessayer';
					}
					
					this.searchResults = [];
				},
			});
		} else {
			this.searchResults = [];
			this.searchError = null;
			this.isSearching = false;
		}
	}
}
