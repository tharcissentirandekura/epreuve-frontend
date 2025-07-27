import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from '../../../app/services/user/user.service';
import { TokenService } from '../../../app/services/auth/token.service';
import { User, ActivityType } from '../../../app/models/user.model';

describe('UserService - Consolidated', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let tokenService: jasmine.SpyObj<TokenService>;

  const mockUser: User = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    role: { name: 'user', id: '1' } as any,
    isActive: true
  };

  beforeEach(() => {
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', [
      'getAccessToken', 
      'getUser', 
      'setUser'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: TokenService, useValue: tokenServiceSpy }
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;

    tokenService.getAccessToken.and.returnValue('mock-token');
    tokenService.getUser.and.returnValue(null);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get user profile', () => {
    service.getProfile().subscribe(user => {
      expect(user).toEqual(jasmine.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com'
      }));
    });

    const req = httpMock.expectOne('http://localhost:8000/api/profile/');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    
    req.flush({ data: mockUser });
  });

  it('should validate avatar file', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1MB

    const result = service.validateAvatarFile(mockFile);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should track activity', () => {
    service.trackActivity(ActivityType.LOGIN, 'User logged in').subscribe();

    const req = httpMock.expectOne('http://localhost:8000/api/activities/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.type).toBe(ActivityType.LOGIN);
    expect(req.request.body.description).toBe('User logged in');
    
    req.flush({});
  });

  it('should get current extended preferences', () => {
    const currentPrefs = service.getCurrentExtendedPreferences();
    
    expect(currentPrefs).toBeDefined();
    expect(currentPrefs.theme).toBe('light');
    expect(currentPrefs.language).toBe('fr');
    expect(currentPrefs.notifications).toBeDefined();
    expect(currentPrefs.privacy).toBeDefined();
    expect(currentPrefs.appearance).toBeDefined();
    expect(currentPrefs.security).toBeDefined();
  });

  it('should check avatar upload support', () => {
    const isSupported = service.isAvatarUploadSupported();
    expect(typeof isSupported).toBe('boolean');
  });

  it('should handle error correctly', () => {
    service.getProfile().subscribe(
      () => fail('Should have failed'),
      error => {
        expect(error.message).toBe('Unauthorized. Please log in again.');
        expect(error.status).toBe(401);
      }
    );

    const req = httpMock.expectOne('http://localhost:8000/api/profile/');
    req.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });
});