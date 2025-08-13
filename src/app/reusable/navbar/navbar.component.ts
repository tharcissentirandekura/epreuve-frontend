import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search.component';
import { AuthService } from '../../services/auth/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/auth/user/user.service';
import { User } from '../../models/user.model';
import { ToastService } from '../../services/toast/toast.service';
import { TokenService } from '../../services/auth/token.service';
import { isPlatformBrowser } from '@angular/common';
@Component({
	selector: 'app-navbar',
	standalone: true,
	imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule, SearchBarComponent, MatIconModule],
	templateUrl: './navbar.component.html',
	styleUrl: './navbar.component.scss',

})
export class NavbarComponent implements OnInit, OnDestroy {
	isSearchBarVisible: boolean = false;
	searchQuery: string = '';
	searchResults: any[] = [];
	isFeatureOn: boolean = false;
	currentUser: User | null = null;
	private tokenCheckInterval: any;

	/**
	 * 
	 * @param authservice service for authentication
	 * @param userService service for user operations,CRUD
	 */

	constructor(
		private authservice: AuthService,
		private userService: UserService,
		private toastService: ToastService,
		private tokenService: TokenService,
		@Inject(PLATFORM_ID) private platformId: Object
	) {
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
		} else {
			this.currentUser = null; // Reset currentUser if not authenticated
		}
	}

	ngOnInit(): void {
		// Only set up token checking in the browser, not during SSR
		if (isPlatformBrowser(this.platformId)) {
			// Check token validity periodically (every 30 seconds)
			this.tokenCheckInterval = setInterval(() => {
				this.checkTokenExpiration();
			}, 30000);
		}
	}

	ngOnDestroy(): void {
		if (this.tokenCheckInterval) {
			clearInterval(this.tokenCheckInterval);
		}
	}

	private checkTokenExpiration(): void {
		// Only check token expiration in the browser
		if (!isPlatformBrowser(this.platformId)) return;

		const token = this.tokenService.getToken();
		if (token && token.access && !this.tokenService.isTokenValid(token.access)) {
			// Token is expired, show toast and logout
			this.toastService.error('Session expirée. Vous avez été déconnecté.', 4000);
			this.currentUser = null;
			setTimeout(() => {
				this.authservice.logout();
			}, 1000);
		}
	}

	get isLoggedIn(): boolean {
		return this.authservice.isAuthenticated();
	}

	get currentUsername(): string {
		return this.isLoggedIn && this.currentUser ? this.currentUser.username : '';
	}
	logout() {
		// Show logout toast notification
		this.toastService.success('Déconnexion réussie! À bientôt.', 3000);
		// Clear the token from local storage and redirect
			this.authservice.logout();
	}




}


