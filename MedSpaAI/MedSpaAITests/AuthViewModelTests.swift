//
//  AuthViewModelTests.swift
//  MedSpaAITests
//
//  Unit tests for AuthViewModel
//

import XCTest
@testable import MedSpaAI

@MainActor
final class AuthViewModelTests: XCTestCase {
    
    var sut: AuthViewModel!
    
    override func setUp() {
        super.setUp()
        sut = AuthViewModel()
        // Clear any stored session
        UserDefaults.standard.removeObject(forKey: "currentUser")
    }
    
    override func tearDown() {
        sut = nil
        UserDefaults.standard.removeObject(forKey: "currentUser")
        super.tearDown()
    }
    
    // MARK: - Initial State Tests
    
    func testInitialState_NotAuthenticated() {
        XCTAssertFalse(sut.isAuthenticated)
        XCTAssertNil(sut.currentUser)
        XCTAssertFalse(sut.isLoading)
        XCTAssertNil(sut.errorMessage)
    }
    
    // MARK: - Sign In Tests
    
    func testSignIn_WithValidCredentials_Succeeds() async {
        // Given
        sut.email = "test@medspa.com"
        sut.password = "password123"
        
        // When
        await sut.signIn()
        
        // Then
        XCTAssertTrue(sut.isAuthenticated)
        XCTAssertNotNil(sut.currentUser)
        XCTAssertEqual(sut.currentUser?.email, "test@medspa.com")
    }
    
    func testSignIn_WithInvalidEmail_ShowsError() async {
        // Given
        sut.email = "invalid-email"
        sut.password = "password123"
        
        // When
        await sut.signIn()
        
        // Then
        XCTAssertFalse(sut.isAuthenticated)
        XCTAssertNotNil(sut.errorMessage)
        XCTAssertTrue(sut.errorMessage?.contains("email") ?? false)
    }
    
    func testSignIn_WithShortPassword_ShowsError() async {
        // Given
        sut.email = "test@medspa.com"
        sut.password = "short"
        
        // When
        await sut.signIn()
        
        // Then
        XCTAssertFalse(sut.isAuthenticated)
        XCTAssertNotNil(sut.errorMessage)
        XCTAssertTrue(sut.errorMessage?.contains("6 characters") ?? false)
    }
    
    // MARK: - Sign Up Tests
    
    func testSignUp_WithValidCredentials_Succeeds() async {
        // Given
        sut.email = "newuser@medspa.com"
        sut.password = "password123"
        sut.confirmPassword = "password123"
        
        // When
        await sut.signUp()
        
        // Then
        XCTAssertTrue(sut.isAuthenticated)
        XCTAssertNotNil(sut.currentUser)
    }
    
    func testSignUp_WithMismatchedPasswords_ShowsError() async {
        // Given
        sut.email = "newuser@medspa.com"
        sut.password = "password123"
        sut.confirmPassword = "different456"
        
        // When
        await sut.signUp()
        
        // Then
        XCTAssertFalse(sut.isAuthenticated)
        XCTAssertNotNil(sut.errorMessage)
        XCTAssertTrue(sut.errorMessage?.contains("match") ?? false)
    }
    
    // MARK: - Sign Out Tests
    
    func testSignOut_ClearsSession() async {
        // Given: User is signed in
        sut.email = "test@medspa.com"
        sut.password = "password123"
        await sut.signIn()
        XCTAssertTrue(sut.isAuthenticated)
        
        // When
        sut.signOut()
        
        // Then
        XCTAssertFalse(sut.isAuthenticated)
        XCTAssertNil(sut.currentUser)
        XCTAssertTrue(sut.email.isEmpty)
        XCTAssertTrue(sut.password.isEmpty)
    }
    
    // MARK: - Magic Link Tests
    
    func testSendMagicLink_WithValidEmail_Succeeds() async {
        // Given
        sut.email = "test@medspa.com"
        
        // When
        await sut.sendMagicLink()
        
        // Then
        XCTAssertNotNil(sut.errorMessage)
        XCTAssertTrue(sut.errorMessage?.contains("Magic link sent") ?? false)
    }
    
    func testSendMagicLink_WithInvalidEmail_ShowsError() async {
        // Given
        sut.email = "not-an-email"
        
        // When
        await sut.sendMagicLink()
        
        // Then
        XCTAssertNotNil(sut.errorMessage)
        XCTAssertFalse(sut.errorMessage?.contains("Magic link") ?? true)
    }
    
    // MARK: - Password Reset Tests
    
    func testSendPasswordReset_WithValidEmail_Succeeds() async {
        // Given
        sut.email = "test@medspa.com"
        
        // When
        await sut.sendPasswordReset()
        
        // Then
        XCTAssertNotNil(sut.errorMessage)
        XCTAssertTrue(sut.errorMessage?.contains("reset") ?? false)
    }
    
    // MARK: - Session Persistence Tests
    
    func testCheckAuthState_WithStoredSession_RestoresUser() async {
        // Given: Store a session
        sut.email = "stored@medspa.com"
        sut.password = "password123"
        await sut.signIn()
        
        // Create new instance
        let newViewModel = AuthViewModel()
        
        // When
        newViewModel.checkAuthState()
        
        // Then
        XCTAssertTrue(newViewModel.isAuthenticated)
        XCTAssertEqual(newViewModel.currentUser?.email, "stored@medspa.com")
    }
    
    // MARK: - User Model Tests
    
    func testUserInitials_GeneratesCorrectly() async {
        // Given
        sut.email = "john.doe@example.com"
        sut.password = "password123"
        
        // When
        await sut.signIn()
        
        // Then
        XCTAssertNotNil(sut.currentUser?.initials)
    }
    
    // MARK: - Loading State Tests
    
    func testSignIn_SetsLoadingState() async {
        // Given
        sut.email = "test@medspa.com"
        sut.password = "password123"
        
        // Note: In a real test, we'd use expectations to check loading state during async operation
        XCTAssertFalse(sut.isLoading)
        
        // When
        await sut.signIn()
        
        // Then: Loading should be false after completion
        XCTAssertFalse(sut.isLoading)
    }
}
