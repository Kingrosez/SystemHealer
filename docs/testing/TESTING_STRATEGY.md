# Testing Strategy

## 1. Purpose
This document defines the testing strategy, approaches, and standards for SystemHealer.

## 2. Testing Levels

### 2.1 Unit Tests
- Test individual functions/methods in isolation
- Fast execution (< 100ms each)
- Mock external dependencies
- 90%+ code coverage target

### 2.2 Integration Tests
- Test API endpoints with real database
- Test service interactions
- 80%+ coverage target for critical paths

### 2.3 End-to-End Tests (Future)
- Test full user workflows
- Run against deployed application
- Selenium/Cypress integration planned

## 3. Backend Testing (Java)

### 3.1 Testing Stack
- JUnit 5
- Mockito for mocking
- Spring Boot Test
- Testcontainers for integration tests

### 3.2 Test Structure
```
src/
├── test/
│   ├── java/com/kingrosez/systemhealer/
│   │   ├── service/
│   │   │   ├── RepairServiceTest.java
│   │   ├── controller/
│   │   │   ├── RepairControllerTest.java
│   │   └── SystemHealerApplicationTests.java
```

### 3.3 Example Unit Test
```java
@ExtendWith(MockitoExtension.class)
class RepairServiceTest {

    @Mock
    private RepairRepository repository;

    @InjectMocks
    private RepairService service;

    @Test
    void startSfc_createsHistoryEntry() {
        // Arrange
        when(repository.save(any())).thenAnswer(invocation -> {
            RepairHistory h = invocation.getArgument(0);
            h.setId(1L);
            return h;
        });

        // Act
        RepairHistory result = service.startSfc(true);

        // Assert
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getOperationType()).isEqualTo("SFC");
        assertThat(result.getStatus()).isEqualTo(Status.IN_PROGRESS);
        verify(repository).save(any(RepairHistory.class));
    }
}
```

### 3.4 Integration Test Example
```java
@SpringBootTest
@AutoConfigureTestDatabase
@TestPropertySource(properties = {
    "spring.flyway.enabled=false"
})
class RepairControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void postSfc_returnsInProgress() throws Exception {
        mockMvc.perform(post("/api/repair/sfc")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"createRestorePoint\":false}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.operationType").value("SFC"))
            .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }
}
```

## 4. Frontend Testing (TypeScript)

### 4.1 Testing Stack
- Vitest (test runner)
- React Testing Library
- Jest DOM
- MSW (Mock Service Worker)

### 4.2 Test Structure
```
src/
├── __tests__/
│   ├── components/
│   │   ├── HistoryCard.test.tsx
│   ├── hooks/
│   │   ├── useHistory.test.ts
│   └── api/
│       ├── client.test.ts
```

### 4.3 Example React Test
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../../mocks/server';
import { rest } from 'msw';
import { HistoryList } from './HistoryList';

describe('HistoryList', () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    queryClient.clear();
  });

  it('displays loading state', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HistoryList />
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders history items', async () => {
    server.use(
      rest.get('/api/history', (req, res, ctx) => {
        return res(ctx.json({
          content: [
            { id: 1, operationType: 'SFC', status: 'COMPLETED' }
          ],
          totalElements: 1
        }));
      })
    );

    render(
      <QueryClientProvider client={queryClient}>
        <HistoryList />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('SFC')).toBeInTheDocument();
    });
  });
});
```

### 4.4 Mock Service Worker setup
```tsx
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/history', (req, res, ctx) => {
    return res(ctx.json({
      content: [],
      totalElements: 0
    }));
  }),
];
```

## 5. Windows Command Testing

### 5.1 Mocking External Commands
Never execute real Windows commands in tests:

```java
@Test
void sfcCommand_returnsSuccess() throws Exception {
    // Arrange
    Process process = mock(Process.class);
    when(processBuilder.start()).thenReturn(process);
    when(process.waitFor(anyLong(), any())).thenReturn(true);
    when(process.exitValue()).thenReturn(0);

    // Act
    CommandResult result = executor.execute("sfc", "/scannow");

    // Assert
    assertThat(result.exitCode()).isEqualTo(0);
}
```

### 5.2 Integration Test with Mock
```java
@Test
void sfcIntegration_runsSuccessfully() {
    // Use a test Windows environment or mock
    try (MockedStatic<Runtime> mockedRuntime = mockStatic(Runtime.class)) {
        // Setup mock process execution
        mockedRuntime.when(Runtime::getRuntime).thenReturn(mockRuntime);
        // ... test logic
    }
}
```

## 6. Test Configuration

### 6.1 Maven Test Profile
```xml
<profiles>
  <profile>
    <id>test</id>
    <build>
      <plugins>
        <plugin>
          <groupId>org.jacoco</groupId>
          <artifactId>jacoco-maven-plugin</artifactId>
          <configuration>
            <exclude>
              **/*Application.*
              **/*Config.*
            </exclude>
          </configuration>
        </plugin>
      </plugins>
    </build>
  </profile>
</profiles>
```

### 6.2 Jest Configuration
```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.*']
    }
  }
});
```

## 7. Test Data Management

### 7.1 Test Fixtures
```java
// TestDataFactory.java
public class TestDataFactory {
    public static RepairHistory createSfcHistory() {
        RepairHistory history = new RepairHistory();
        history.setOperationType("SFC");
        history.setStatus(Status.COMPLETED);
        history.setStartTime(LocalDateTime.now().minusHours(1));
        return history;
    }
}
```

### 7.2 Frontend Fixtures
```ts
// src/__tests__/fixtures/history.ts
export const mockHistoryResponse = {
  content: [
    { id: 1, operationType: 'SFC', status: 'COMPLETED', startTime: '2024-01-15T10:00:00Z' }
  ],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 50
};
```

## 8. CI/CD Integration

### 8.1 GitHub Actions
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Run tests
        run: ./mvnw verify
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### 8.2 Coverage Thresholds
- Backend: 80% line coverage
- Frontend: 70% line coverage
- Warnings fail the build

## 9. Performance Testing

### 9.1 Load Testing (Future)
- k6 or Gatling for API load testing
- Target: 100 RPS sustained
- Response time: p95 < 100ms

### 9.2 Memory Testing
```java
@Test
void memoryUsage_staysBelowThreshold() {
    long initialMemory = getUsedMemory();

    // Run 100 operations
    for (int i = 0; i < 100; i++) {
        service.runSfc();
    }

    long finalMemory = getUsedMemory();
    assertThat(finalMemory - initialMemory).isLessThan(100_000_000); // 100MB
}
```

## 10. Security Testing

### 10.1 Static Analysis
- SpotBugs for Java
- ESLint security rules for TypeScript
- OWASP Dependency-Check

### 10.2 Dynamic Analysis (Future)
- OWASP ZAP for web interface
- API penetration testing

## 11. Test Execution Commands

### 11.1 Run All Tests
```bash
# Backend
./mvnw test

# Frontend
npm run test
```

### 11.2 Run Specific Tests
```bash
# Backend specific
./mvnw test -Dtest=RepairServiceTest

# Frontend specific
npm run test -- HistoryList.test.tsx
```

### 11.3 Generate Coverage Report
```bash
# Backend
./mvnw verify

# Frontend
npm run test -- --coverage
```

## 12. Testing Checklist

Before each release:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Coverage above thresholds
- [ ] No security warnings
- [ ] Windows command mocks working
- [ ] API contract tests updated
- [ ] Performance benchmarks recorded