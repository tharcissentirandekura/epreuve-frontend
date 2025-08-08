import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search.component';
import { AuthService } from '../../services/auth/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/auth/user/user.service';
import { User } from '../../models/user.model';
@Component({
	selector: 'app-navbar',
	standalone: true,
	imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule, SearchBarComponent, MatIconModule],
	templateUrl: './navbar.component.html',
	styleUrl: './navbar.component.scss',

})
export class NavbarComponent implements OnInit {
	isSearchBarVisible: boolean = false;
	searchQuery: string = '';
	searchResults: any[] = [];
	isFeatureOn: boolean = false;
	currentUser: User|null = null;

	/**
	 * 
	 * @param authservice service for authentication
	 * @param userService service for user operations,CRUD
	 */

	constructor( private authservice: AuthService, private userService: UserService,) {
		// add more erros handling
		if (this.authservice.isAuthenticated()) {
			this.userService.getCurrentUser().subscribe({
				next: (user: User) => {
					this.currentUser = user;
				},
				error: (error) => {
					console.error("Failed to get current user", error);
					this.currentUser = null; // Reset currentUser on error
				}
			});
		}else{
			this.currentUser = null; // Reset currentUser if not authenticated
		}
	}

	ngOnInit(): void {
		// No subscription needed - we'll check authentication status directly
	}

	get isLoggedIn(): boolean {
		return this.authservice.isAuthenticated();
	}
	logout() {
		// Clear the token from local storage
		this.authservice.logout();
	}




}


