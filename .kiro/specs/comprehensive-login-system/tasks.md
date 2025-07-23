# Implementation Plan

- [ ] 1. Install required dependencies and setup project structure





  - Install libphonenumber-js for phone number validation and formatting
  - Verify lucide-react is available for loading icons
  - Check existing UI components (Tabs, Card, Button, Input, Label) are properly imported
  - _Requirements: 2.2, 5.5_

- [ ] 2. Create phone number validation utilities




  - Write utility functions for phone number validation using libphonenumber-js
  - Implement phone number formatting for Indian numbers (+91)
  - Create E.164 format conversion functions
  - Add unit tests for phone validation utilities
  - _Requirements: 2.1, 2.2_

- [ ] 3. Implement enhanced login page state management
  - Add state variables for phone number, OTP, verification ID
  - Implement loading states for different authentication methods (email, phone, Google)
  - Add active tab state management for switching between email and phone
  - Create resend timer state for OTP functionality
  - Add shared exam link detection state
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 6.1_

- [ ] 4. Create tabbed interface structure
  - Implement Tabs component with Email and Phone tabs
  - Create TabsContent for email authentication form
  - Create TabsContent for phone authentication form
  - Add proper tab switching functionality with state preservation
  - _Requirements: 6.1, 6.2_

- [ ] 5. Implement Google OAuth login button
  - Create Google login button with proper styling and Google icon
  - Integrate with existing loginWithGoogle method from ExamContext
  - Add loading state handling during Google authentication
  - Implement error handling for popup blocked scenarios
  - Add success/error toast notifications
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.2, 5.3_

- [ ] 6. Enhance email/password login form
  - Update existing email/password form with improved styling
  - Add "Forgot Password" link integration
  - Implement proper form validation and error display
  - Add loading state with spinner during authentication
  - Integrate toast notifications for success/error feedback
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.2, 5.3_

- [ ] 7. Implement phone number input and validation
  - Create phone number input field with +91 prefix handling
  - Add real-time phone number validation and formatting
  - Implement user existence check before sending OTP
  - Add proper error messages for invalid phone numbers
  - Create "Send OTP" button with loading state
  - _Requirements: 2.1, 2.2, 2.6, 5.4_

- [ ] 8. Implement OTP verification interface
  - Create OTP input field with 6-digit validation
  - Add "Change Number" button to return to phone input
  - Implement "Verify OTP" button with loading state
  - Add resend OTP functionality with 30-second countdown timer
  - Display countdown timer and resend button state management
  - _Requirements: 2.3, 2.4, 2.5, 5.5_

- [ ] 9. Integrate phone authentication with Firebase
  - Connect phone number input to Firebase Phone Authentication
  - Implement OTP sending using existing loginWithPhone method
  - Add OTP verification using existing verifyOTP method
  - Implement resend OTP functionality using existing resendOTP method
  - Add proper error handling for Firebase phone auth errors
  - _Requirements: 2.1, 2.3, 2.5_

- [ ] 10. Implement shared exam link handling
  - Add detection for shared exam ID in localStorage
  - Create notification banner for shared exam redirection
  - Implement conditional redirection logic after successful authentication
  - Add toast notifications for shared exam redirection
  - _Requirements: 4.1, 4.2, 4.3, 5.3_

- [ ] 11. Add comprehensive error handling and toast notifications
  - Implement specific error messages for different authentication failures
  - Add success toast notifications for all authentication methods
  - Create error toast notifications with actionable messages
  - Add OTP sent confirmation toasts with formatted phone numbers
  - Implement proper error handling for network and Firebase errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 12. Implement timer functionality for OTP resend
  - Create countdown timer starting at 30 seconds
  - Update timer display every second
  - Disable resend button during countdown
  - Enable resend button when timer reaches zero
  - Reset timer when new OTP is sent
  - _Requirements: 2.5, 5.5_

- [ ] 13. Add form validation and user feedback
  - Implement client-side validation for all input fields
  - Add proper form submission handling with preventDefault
  - Create loading indicators for all authentication methods
  - Add proper disabled states for buttons during loading
  - Implement proper focus management and accessibility
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 3.1, 5.1_

- [ ] 14. Integrate with existing authentication context
  - Ensure proper integration with useExam context
  - Verify all authentication methods work with existing user state
  - Test redirection to dashboard after successful login
  - Verify shared exam redirection functionality
  - Test logout and re-login scenarios
  - _Requirements: 1.1, 2.3, 3.2, 4.2, 4.3_

- [ ] 15. Add responsive design and accessibility features
  - Ensure mobile-responsive design for all form elements
  - Add proper ARIA labels and accessibility attributes
  - Implement keyboard navigation support
  - Test with screen readers and accessibility tools
  - Add proper focus indicators and tab order
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 16. Create comprehensive error boundary and fallback handling
  - Add error boundaries for authentication components
  - Implement fallback UI for component errors
  - Add retry mechanisms for transient errors
  - Create proper error logging and monitoring
  - Test error scenarios and recovery flows
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 17. Write unit tests for authentication components
  - Create tests for phone number validation utilities
  - Write tests for form validation logic
  - Add tests for state management and event handlers
  - Create tests for timer functionality
  - Test error handling scenarios
  - _Requirements: 1.1, 2.1, 2.3, 3.1, 5.1_

- [ ] 18. Write integration tests for authentication flows
  - Test complete email/password login flow
  - Test complete phone/OTP verification flow
  - Test Google OAuth authentication flow
  - Test shared exam redirection scenarios
  - Test error handling and recovery flows
  - _Requirements: 1.1, 2.3, 3.2, 4.2, 4.3_