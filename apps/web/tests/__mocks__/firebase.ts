const mockFirebase = {
   auth: jest.fn(() => mockFirebase),
   sendPasswordResetEmail: jest.fn(() => Promise.resolve(200)),
}

export { mockFirebase as default }
