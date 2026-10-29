"""
Adaptive Career Intelligence System - Question Bank & Diagnostic Engine
Evaluates 10 Core Career Readiness Dimensions with Adaptive Selection and Deterministic Scoring.
"""

DIMENSIONS = {
    "problem_solving": {
        "id": "problem_solving",
        "title": "Problem Solving & Logic",
        "category": "Demonstrated Technical",
        "description": "Algorithmic reasoning, analytical decomposition, and edge-case handling.",
        "isObjective": True,
    },
    "programming_fundamentals": {
        "id": "programming_fundamentals",
        "title": "Programming & Syntax",
        "category": "Demonstrated Technical",
        "description": "Language semantics, data types, variable scope, and control flow.",
        "isObjective": True,
    },
    "dsa": {
        "id": "dsa",
        "title": "Data Structures & Algorithms",
        "category": "Demonstrated Technical",
        "description": "Arrays, hash maps, trees, graphs, sorting, and Big-O computational complexity.",
        "isObjective": True,
    },
    "dev_practices_debugging": {
        "id": "dev_practices_debugging",
        "title": "Development Practices & Debugging",
        "category": "Demonstrated Technical",
        "description": "Testing, Git workflows, debugging methodologies, and CI/CD pipelines.",
        "isObjective": True,
    },
    "databases": {
        "id": "databases",
        "title": "Database & Data Handling",
        "category": "Demonstrated Technical",
        "description": "SQL joins, indexing, normalization, transactions, and NoSQL trade-offs.",
        "isObjective": True,
    },
    "system_design": {
        "id": "system_design",
        "title": "System Design & Architecture",
        "category": "Demonstrated Technical",
        "description": "REST APIs, microservices, caching, concurrency, and distributed scalability.",
        "isObjective": True,
    },
    "communication": {
        "id": "communication",
        "title": "Communication & Collaboration",
        "category": "Professional Craft",
        "description": "Technical documentation, code review etiquette, and cross-functional clarity.",
        "isObjective": True,
    },
    "learning_agility": {
        "id": "learning_agility",
        "title": "Learning Agility & Adaptability",
        "category": "Professional Craft",
        "description": "Autonomy in learning new frameworks, troubleshooting unknown libraries, and adaptability.",
        "isObjective": True,
    },
    "practical_projects": {
        "id": "practical_projects",
        "title": "Project Experience & Implementation",
        "category": "Self-Reported Experience",
        "description": "Hands-on experience building full applications, APIs, and deploying software.",
        "isObjective": False,
    },
    "career_preferences": {
        "id": "career_preferences",
        "title": "Career Interests & Work Style",
        "category": "Career Preference",
        "description": "Preferred tech stack, engineering domain, and workplace culture.",
        "isObjective": False,
    },
}

# Bank of 40 Curated Multi-Dimensional Assessment Questions
ADAPTIVE_QUESTION_BANK = [
    # ----------------------------------------------------
    # 1. Problem Solving & Logic (Foundational, Intermediate, Advanced)
    # ----------------------------------------------------
    {
        "id": "q_prob_1",
        "dimension": "problem_solving",
        "type": "scenario",
        "difficulty": "foundational",
        "questionText": "A service is returning HTTP 504 Gateway Timeout errors intermittently during peak traffic hours. What is your initial systematic diagnostic procedure?",
        "options": [
            {
                "text": "Inspect server CPU/memory metrics and database slow-query logs to find the bottleneck upstream.",
                "score": 100,
                "isCorrect": True,
                "weight": {"software-developer": 9, "backend-developer": 10, "devops-engineer": 9},
            },
            {
                "text": "Immediately double the API timeout limit on client devices to 60 seconds.",
                "score": 40,
                "isCorrect": False,
                "weight": {"software-developer": 2},
            },
            {
                "text": "Restart the client application repeatedly until the request succeeds.",
                "score": 15,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Clear the browser cache and cookies across all user workstations.",
                "score": 25,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_prob_2",
        "dimension": "problem_solving",
        "type": "multiple_choice",
        "difficulty": "intermediate",
        "questionText": "You need to find if an unsorted array of n integers contains any two numbers that sum up to a target value k. What is the most time-efficient optimal approach?",
        "options": [
            {
                "text": "Use a Hash Set to store complements in O(n) time and O(n) space.",
                "score": 100,
                "isCorrect": True,
                "weight": {"software-developer": 10, "backend-developer": 10, "full-stack-developer": 8},
            },
            {
                "text": "Use two nested loops comparing every pair in O(n^2) time and O(1) space.",
                "score": 50,
                "isCorrect": False,
                "weight": {"software-developer": 4},
            },
            {
                "text": "Recursively check all subsets of the array in O(2^n) time.",
                "score": 20,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Convert the array to a binary string and perform bitwise XOR operations.",
                "score": 25,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_prob_3",
        "dimension": "problem_solving",
        "type": "scenario",
        "difficulty": "advanced",
        "questionText": "An analytics pipeline experiences race conditions when multiple worker processes simultaneously update a shared counter in Redis. How do you guarantee atomic increments?",
        "options": [
            {
                "text": "Use Redis atomic INCR command or Lua script with MULTI/EXEC transaction blocks.",
                "score": 100,
                "isCorrect": True,
                "weight": {"backend-developer": 10, "software-developer": 9, "cloud-engineer": 8},
            },
            {
                "text": "Read the value in application memory, increment it, and write it back with standard SET.",
                "score": 35,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Add a random 10ms sleep in worker threads before calling GET and SET.",
                "score": 20,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Run workers strictly on a single CPU core without concurrency.",
                "score": 45,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },

    # ----------------------------------------------------
    # 2. Programming Fundamentals & Code Reading
    # ----------------------------------------------------
    {
        "id": "q_prog_1",
        "dimension": "programming_fundamentals",
        "type": "code_reading",
        "difficulty": "foundational",
        "language": "python",
        "codeSnippet": "def modify_list(items):\n    items.append(4)\n    items = [1, 2, 3]\n\nnums = [10, 20]\nmodify_list(nums)\nprint(nums)",
        "questionText": "What will be printed when this Python code snippet executes?",
        "options": [
            {
                "text": "[10, 20, 4]",
                "score": 100,
                "isCorrect": True,
                "weight": {"python-developer": 10, "software-developer": 9, "data-scientist": 9},
            },
            {
                "text": "[1, 2, 3]",
                "score": 40,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "[10, 20]",
                "score": 45,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "TypeError: pass by reference re-assignment error",
                "score": 30,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_prog_2",
        "dimension": "programming_fundamentals",
        "type": "code_reading",
        "difficulty": "intermediate",
        "language": "javascript",
        "codeSnippet": "console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');",
        "questionText": "What is the exact console output order of this JavaScript event loop snippet?",
        "options": [
            {
                "text": "A -> D -> C -> B (Synchronous -> Microtasks -> Macrotasks)",
                "score": 100,
                "isCorrect": True,
                "weight": {"frontend-developer": 10, "full-stack-developer": 10, "software-developer": 8},
            },
            {
                "text": "A -> B -> C -> D",
                "score": 35,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "A -> D -> B -> C",
                "score": 50,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "C -> A -> D -> B",
                "score": 30,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_prog_3",
        "dimension": "programming_fundamentals",
        "type": "multiple_choice",
        "difficulty": "advanced",
        "questionText": "In object-oriented software engineering, what is the primary benefit of adhering to the Dependency Inversion Principle (DIP)?",
        "options": [
            {
                "text": "High-level modules depend on abstractions rather than low-level concrete implementations, enabling testability and loose coupling.",
                "score": 100,
                "isCorrect": True,
                "weight": {"software-developer": 10, "java-developer": 10, "backend-developer": 9},
            },
            {
                "text": "It forces every class to inherit from a single abstract superclass.",
                "score": 35,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "It ensures functions never take more than one parameter.",
                "score": 20,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "It prevents memory leaks by automatically deleting objects.",
                "score": 25,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },

    # ----------------------------------------------------
    # 3. Data Structures & Algorithms (DSA)
    # ----------------------------------------------------
    {
        "id": "q_dsa_1",
        "dimension": "dsa",
        "type": "multiple_choice",
        "difficulty": "foundational",
        "questionText": "Which data structure provides constant O(1) average time complexity for both key-based insertions and lookups?",
        "options": [
            {
                "text": "Hash Map (Hash Table)",
                "score": 100,
                "isCorrect": True,
                "weight": {"software-developer": 10, "backend-developer": 9, "full-stack-developer": 8},
            },
            {
                "text": "Singly Linked List",
                "score": 30,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Binary Search Tree (unbalanced)",
                "score": 50,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Sorted Array (with linear search)",
                "score": 35,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_dsa_2",
        "dimension": "dsa",
        "type": "scenario",
        "difficulty": "intermediate",
        "questionText": "You are designing an undo/redo feature for a text editor. Which pair of data structures is most naturally suited to manage user action histories?",
        "options": [
            {
                "text": "Two Stacks (Undo stack and Redo stack with LIFO semantics)",
                "score": 100,
                "isCorrect": True,
                "weight": {"software-developer": 10, "frontend-developer": 9, "full-stack-developer": 8},
            },
            {
                "text": "A single FIFO Queue and a Hash Set",
                "score": 40,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "A Min-Heap priority queue based on character length",
                "score": 30,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "A circular linked list without pointers",
                "score": 25,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_dsa_3",
        "dimension": "dsa",
        "type": "code_reading",
        "difficulty": "advanced",
        "language": "python",
        "codeSnippet": "def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1",
        "questionText": "What is the worst-case time and auxiliary space complexity of this standard binary search algorithm on a sorted list?",
        "options": [
            {
                "text": "Time: O(log n), Space: O(1)",
                "score": 100,
                "isCorrect": True,
                "weight": {"software-developer": 10, "backend-developer": 10, "data-scientist": 8},
            },
            {
                "text": "Time: O(n), Space: O(log n)",
                "score": 40,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Time: O(n log n), Space: O(n)",
                "score": 35,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Time: O(1), Space: O(1)",
                "score": 25,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },

    # ----------------------------------------------------
    # 4. Software Development Practices & Debugging
    # ----------------------------------------------------
    {
        "id": "q_dev_1",
        "dimension": "dev_practices_debugging",
        "type": "multiple_choice",
        "difficulty": "foundational",
        "questionText": "You are collaborating on a shared Git repository. You need to incorporate changes from main into your feature branch before submitting a pull request. What is the standard recommended practice?",
        "options": [
            {
                "text": "Checkout your feature branch, pull or rebase the latest commits from origin/main, resolve conflicts locally, and run tests.",
                "score": 100,
                "isCorrect": True,
                "weight": {"software-developer": 10, "full-stack-developer": 10, "devops-engineer": 9},
            },
            {
                "text": "Force push (git push --force) directly onto origin/main to overwrite any existing changes.",
                "score": 10,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Delete the remote repository clone and create a new project from scratch.",
                "score": 15,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Commit all files directly using the GitHub web interface without testing.",
                "score": 35,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_dev_2",
        "dimension": "dev_practices_debugging",
        "type": "scenario",
        "difficulty": "intermediate",
        "questionText": "A newly deployed web feature works in the developer's local environment but fails in staging with 'Uncaught ReferenceError: process is not defined'. What is the most probable cause?",
        "options": [
            {
                "text": "Node.js environment variables (process.env) were referenced in browser-bundled client code without client build-time substitution (e.g. Vite import.meta.env).",
                "score": 100,
                "isCorrect": True,
                "weight": {"frontend-developer": 10, "full-stack-developer": 10, "software-developer": 8},
            },
            {
                "text": "The client operating system is running out of physical RAM memory.",
                "score": 30,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "The CSS stylesheet has an invalid media query.",
                "score": 20,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "The database port 5432 is blocked by a staging firewall.",
                "score": 40,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_dev_3",
        "dimension": "dev_practices_debugging",
        "type": "multiple_choice",
        "difficulty": "advanced",
        "questionText": "What distinguishes an integration test from a unit test in modern automated testing pipelines?",
        "options": [
            {
                "text": "Integration tests verify interactions between multiple cooperating modules or subsystems (e.g. API endpoint with database), whereas unit tests isolate single functions with mocked dependencies.",
                "score": 100,
                "isCorrect": True,
                "weight": {"software-tester-qa": 10, "software-developer": 10, "backend-developer": 9},
            },
            {
                "text": "Unit tests only test user interfaces while integration tests only test database tables.",
                "score": 35,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Integration tests run faster than unit tests and require zero network access.",
                "score": 25,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Unit tests are written manually by clients while integration tests are written by compilers.",
                "score": 15,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },

    # ----------------------------------------------------
    # 5. Database & Data Handling
    # ----------------------------------------------------
    {
        "id": "q_db_1",
        "dimension": "databases",
        "type": "code_reading",
        "difficulty": "foundational",
        "language": "sql",
        "codeSnippet": "SELECT u.name, COUNT(o.id) AS total_orders\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nGROUP BY u.id, u.name;",
        "questionText": "Why is a LEFT JOIN used in this query instead of an INNER JOIN?",
        "options": [
            {
                "text": "To include all registered users in the result set, even those who have placed zero orders (total_orders = 0).",
                "score": 100,
                "isCorrect": True,
                "weight": {"database-developer": 10, "backend-developer": 9, "data-analyst": 9},
            },
            {
                "text": "To sort the output in alphabetical descending order.",
                "score": 25,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "To prevent duplicate orders from being created in the database.",
                "score": 30,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "To enforce foreign key constraints between users and orders.",
                "score": 35,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_db_2",
        "dimension": "databases",
        "type": "scenario",
        "difficulty": "intermediate",
        "questionText": "A relational database table with 5,000,000 rows executes a query with `WHERE email = 'user@example.com'` in 1,800ms. What index modification is required to reduce latency under 5ms?",
        "options": [
            {
                "text": "Create a B-Tree index on the `email` column (e.g. CREATE INDEX idx_users_email ON users(email)).",
                "score": 100,
                "isCorrect": True,
                "weight": {"database-developer": 10, "backend-developer": 10, "software-developer": 8},
            },
            {
                "text": "Partition the database by converting all emails to lowercase in application memory.",
                "score": 35,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Re-run the SELECT query 10 times consecutively so it caches in client memory.",
                "score": 25,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Store the email in a separate plain-text .csv file on the web server.",
                "score": 15,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_db_3",
        "dimension": "databases",
        "type": "multiple_choice",
        "difficulty": "advanced",
        "questionText": "What does the 'Isolation' property in relational database ACID guarantees specifically ensure?",
        "options": [
            {
                "text": "Concurrent transactions execute without interfering with one another, preventing dirty reads and phantom reads based on the isolation level.",
                "score": 100,
                "isCorrect": True,
                "weight": {"backend-developer": 10, "database-developer": 10, "java-developer": 9},
            },
            {
                "text": "Data is automatically encrypted on physical storage drives.",
                "score": 35,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "The database will never crash even during a total server power outage.",
                "score": 30,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Only one user can connect to the database at any given time.",
                "score": 20,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },

    # ----------------------------------------------------
    # 6. System Design & Architecture Fundamentals
    # ----------------------------------------------------
    {
        "id": "q_sys_1",
        "dimension": "system_design",
        "type": "multiple_choice",
        "difficulty": "foundational",
        "questionText": "In RESTful API design, which HTTP method should be used to create a new resource on the server?",
        "options": [
            {
                "text": "POST",
                "score": 100,
                "isCorrect": True,
                "weight": {"backend-developer": 10, "full-stack-developer": 9, "software-developer": 8},
            },
            {
                "text": "GET",
                "score": 25,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "PATCH",
                "score": 60,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "OPTIONS",
                "score": 30,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_sys_2",
        "dimension": "system_design",
        "type": "scenario",
        "difficulty": "intermediate",
        "questionText": "Your application has an endpoint that performs an expensive external calculation taking 4 seconds. The result changes only once per day. How do you optimize this endpoint for 10,000 req/sec?",
        "options": [
            {
                "text": "Introduce an in-memory caching layer (e.g. Redis or Memcached) with an appropriate TTL and cache-aside invalidation.",
                "score": 100,
                "isCorrect": True,
                "weight": {"backend-developer": 10, "software-developer": 9, "cloud-engineer": 9},
            },
            {
                "text": "Ask clients to wait 4 seconds per request with a progress bar.",
                "score": 20,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Create 10,000 separate threads on the web server to compute the duplicate calculation repeatedly.",
                "score": 30,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Store the computed response in browser localStorage on the developer's laptop.",
                "score": 25,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_sys_3",
        "dimension": "system_design",
        "type": "scenario",
        "difficulty": "advanced",
        "questionText": "You are building a notification system that sends order confirmations via SMS and Email. If the third-party email provider experiences an outage, order processing must not fail. How do you design this?",
        "options": [
            {
                "text": "Decouple order creation from notifications using an asynchronous message queue (e.g. RabbitMQ/Kafka/SQS) with dead-letter retries.",
                "score": 100,
                "isCorrect": True,
                "weight": {"backend-developer": 10, "cloud-engineer": 10, "software-developer": 9},
            },
            {
                "text": "Make synchronous HTTP calls to the email provider in the main HTTP request thread before saving the order.",
                "score": 30,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Cancel customer orders whenever the email service responds with an error.",
                "score": 15,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Hardcode infinite while-loops until the email provider comes back online.",
                "score": 10,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },

    # ----------------------------------------------------
    # 7. Communication & Collaboration
    # ----------------------------------------------------
    {
        "id": "q_comm_1",
        "dimension": "communication",
        "type": "scenario",
        "difficulty": "foundational",
        "questionText": "During a peer code review, you notice a teammate's PR contains a security flaw (SQL injection vulnerability). How do you convey your review feedback professionally?",
        "options": [
            {
                "text": "Point out the specific line constructively, explain the security risk with parameterized query examples, and offer to pair if helpful.",
                "score": 100,
                "isCorrect": True,
                "weight": {"software-developer": 10, "full-stack-developer": 9, "cybersecurity-analyst": 9},
            },
            {
                "text": "Reject the PR publicly with 'This code is terrible and broken.'",
                "score": 10,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Approve the PR silently to avoid hurting the author's feelings.",
                "score": 15,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Secretly rewrite their branch without telling them.",
                "score": 25,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_comm_2",
        "dimension": "communication",
        "type": "scenario",
        "difficulty": "intermediate",
        "questionText": "A non-technical product manager asks why an architectural refactor is required before adding a new feature. How do you explain technical debt effectively?",
        "options": [
            {
                "text": "Explain using business impact: without refactoring, future feature delivery will slow down and bug risk will rise, whereas investing 2 days now ensures faster delivery.",
                "score": 100,
                "isCorrect": True,
                "weight": {"software-developer": 10, "full-stack-developer": 9, "product-manager": 10},
            },
            {
                "text": "Give a 45-minute lecture on compiler bytecode and memory allocation theory.",
                "score": 40,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Refuse to answer and claim engineers don't have to explain architecture to business teams.",
                "score": 10,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Pretend the refactor was already finished without doing the work.",
                "score": 15,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },

    # ----------------------------------------------------
    # 8. Learning Agility & Adaptability
    # ----------------------------------------------------
    {
        "id": "q_learn_1",
        "dimension": "learning_agility",
        "type": "scenario",
        "difficulty": "foundational",
        "questionText": "You are assigned a project using an unfamiliar library or framework you have never used before. How do you approach the onboarding ramp-up?",
        "options": [
            {
                "text": "Review official quickstart documentation, inspect existing repository code patterns, build a small throwaway prototype, and identify core abstractions.",
                "score": 100,
                "isCorrect": True,
                "weight": {"software-developer": 10, "full-stack-developer": 10, "ai-engineer": 9},
            },
            {
                "text": "Refuse the assignment until someone gives you a 40-hour video training course.",
                "score": 25,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Randomly copy code from forums without understanding how components connect.",
                "score": 30,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Rewrite the entire team repository in whatever language you learned in school.",
                "score": 15,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_learn_2",
        "dimension": "learning_agility",
        "type": "scenario",
        "difficulty": "intermediate",
        "questionText": "A major open-source library your system depends on releases a breaking change (deprecated API). How do you approach the upgrade?",
        "options": [
            {
                "text": "Read the official migration guide and changelog, write automated regression tests around current behavior, upgrade in a branch, and verify in staging.",
                "score": 100,
                "isCorrect": True,
                "weight": {"software-developer": 10, "backend-developer": 9, "frontend-developer": 9},
            },
            {
                "text": "Immediately bump the version in package.json and deploy directly to production on Friday evening.",
                "score": 15,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Pin the library permanently to a 5-year-old version and ignore all future security patches.",
                "score": 35,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Disable all automated test suites so the build passes without errors.",
                "score": 10,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },

    # ----------------------------------------------------
    # 9. Practical Projects & Implementation Experience (Self-Reported)
    # ----------------------------------------------------
    {
        "id": "q_proj_1",
        "dimension": "practical_projects",
        "type": "self_assessment",
        "difficulty": "foundational",
        "questionText": "What best describes your practical experience building and deploying software projects?",
        "options": [
            {
                "text": "Full-Stack / Production: Built full-stack apps with authentication, persistent database, and automated deployments (Vercel/Render/AWS).",
                "score": 95,
                "isCorrect": False,
                "weight": {"full-stack-developer": 10, "software-developer": 9, "backend-developer": 9},
            },
            {
                "text": "Working Prototypes: Created multi-file applications with working APIs and local database connections.",
                "score": 75,
                "isCorrect": False,
                "weight": {"software-developer": 8, "frontend-developer": 8},
            },
            {
                "text": "Coursework Exercises: Completed guided laboratory assignments and single-script coding exercises.",
                "score": 50,
                "isCorrect": False,
                "weight": {"software-developer": 5},
            },
            {
                "text": "Starting Out: Currently learning syntax and building my first guided portfolio projects.",
                "score": 30,
                "isCorrect": False,
                "weight": {"software-developer": 3},
            },
        ],
    },
    {
        "id": "q_proj_2",
        "dimension": "practical_projects",
        "type": "self_assessment",
        "difficulty": "intermediate",
        "questionText": "How do you currently verify that your project code works before demonstrating it to others?",
        "options": [
            {
                "text": "Automated Unit & Integration Tests (e.g. Pytest, Jest) alongside manual end-to-end user verification.",
                "score": 95,
                "isCorrect": False,
                "weight": {"software-tester-qa": 10, "software-developer": 9, "backend-developer": 9},
            },
            {
                "text": "Manual testing through Postman API requests and browser click-throughs.",
                "score": 70,
                "isCorrect": False,
                "weight": {"full-stack-developer": 7, "frontend-developer": 7},
            },
            {
                "text": "Ad-hoc print / console.log statements during live execution.",
                "score": 45,
                "isCorrect": False,
                "weight": {"software-developer": 5},
            },
            {
                "text": "Checking if the compiler finishes without throwing red errors.",
                "score": 30,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },

    # ----------------------------------------------------
    # 10. Career Interests & Preferred Working Style (Career Preferences)
    # ----------------------------------------------------
    {
        "id": "q_pref_1",
        "dimension": "career_preferences",
        "type": "career_preference",
        "difficulty": "foundational",
        "questionText": "Which area of engineering craft brings you the greatest personal satisfaction?",
        "options": [
            {
                "text": "Architecting reliable backend APIs, data pipelines, and scalable database systems.",
                "score": 90,
                "isCorrect": False,
                "weight": {"backend-developer": 10, "software-developer": 8, "java-developer": 9},
            },
            {
                "text": "End-to-end product engineering connecting responsive UI with APIs and database models.",
                "score": 90,
                "isCorrect": False,
                "weight": {"full-stack-developer": 10, "software-developer": 8, "frontend-developer": 6},
            },
            {
                "text": "Exploring datasets, statistical modeling, and deriving strategic business trends.",
                "score": 90,
                "isCorrect": False,
                "weight": {"data-analyst": 10, "data-scientist": 9},
            },
            {
                "text": "Building AI pipelines, machine learning models, and Generative AI workflows.",
                "score": 90,
                "isCorrect": False,
                "weight": {"ai-engineer": 10, "machine-learning-engineer": 10},
            },
            {
                "text": "Automating cloud infrastructure, container orchestration, and CI/CD pipelines.",
                "score": 90,
                "isCorrect": False,
                "weight": {"cloud-engineer": 10, "devops-engineer": 10},
            },
            {
                "text": "Cybersecurity defense, vulnerability scanning, and secure systems architecture.",
                "score": 90,
                "isCorrect": False,
                "weight": {"cybersecurity-analyst": 10},
            },
        ],
    },
    {
        "id": "q_pref_2",
        "dimension": "career_preferences",
        "type": "career_preference",
        "difficulty": "foundational",
        "questionText": "What type of technical role environment matches your preferred work style?",
        "options": [
            {
                "text": "Core Product Engineering: Feature planning, coding, and shipping user-facing software.",
                "score": 85,
                "isCorrect": False,
                "weight": {"full-stack-developer": 10, "software-developer": 9, "frontend-developer": 9},
            },
            {
                "text": "Deep Systems & Infrastructure: High reliability, distributed services, and DevOps automation.",
                "score": 85,
                "isCorrect": False,
                "weight": {"cloud-engineer": 10, "devops-engineer": 10, "backend-developer": 8},
            },
            {
                "text": "Data & Research: Machine learning experiments, statistical validation, and analytics.",
                "score": 85,
                "isCorrect": False,
                "weight": {"data-scientist": 10, "ai-engineer": 9, "data-analyst": 9},
            },
            {
                "text": "Quality & Assurance: Automated test architecture, edge-case coverage, and security posture.",
                "score": 85,
                "isCorrect": False,
                "weight": {"software-tester-qa": 10, "cybersecurity-analyst": 9},
            },
        ],
    },
    {
        "id": "q_dsa_4",
        "dimension": "dsa",
        "type": "scenario",
        "difficulty": "intermediate",
        "questionText": "In an unweighted social network graph, which traversal algorithm guarantees finding the shortest connection path between two members with minimal steps?",
        "options": [
            {
                "text": "Breadth-First Search (BFS) using a FIFO queue.",
                "score": 100,
                "isCorrect": True,
                "weight": {"software-developer": 10, "backend-developer": 9},
            },
            {
                "text": "Depth-First Search (DFS) using a recursive call stack.",
                "score": 40,
                "isCorrect": False,
                "weight": {"software-developer": 4},
            },
            {
                "text": "Bellman-Ford algorithm with negative cycle detection.",
                "score": 50,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "In-order binary tree traversal.",
                "score": 20,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_prob_4",
        "dimension": "problem_solving",
        "type": "code_reading",
        "difficulty": "intermediate",
        "language": "python",
        "codeSnippet": "def is_valid_parentheses(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack",
        "questionText": "What does this standard stack-based algorithm verify?",
        "options": [
            {
                "text": "Validates balanced nesting of matching brackets and parentheses in O(n) time.",
                "score": 100,
                "isCorrect": True,
                "weight": {"software-developer": 10, "backend-developer": 9},
            },
            {
                "text": "Counts the frequency of vowels and consonants in a string.",
                "score": 15,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Removes duplicate characters in alphabetical order.",
                "score": 25,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Evaluates reverse polish notation mathematical expressions.",
                "score": 40,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_prog_4",
        "dimension": "programming_fundamentals",
        "type": "multiple_choice",
        "difficulty": "intermediate",
        "questionText": "What is the primary operational difference between a standard collection list and a generator expression in Python?",
        "options": [
            {
                "text": "Generators produce elements lazily on demand using yield with O(1) memory, while lists allocate full memory upfront for all elements.",
                "score": 100,
                "isCorrect": True,
                "weight": {"python-developer": 10, "software-developer": 9, "data-scientist": 9},
            },
            {
                "text": "Generators run on the GPU while lists run on the CPU.",
                "score": 20,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Lists can only store numbers while generators can only store text strings.",
                "score": 15,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Generators permanently lock the computer memory until system reboot.",
                "score": 10,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_dev_4",
        "dimension": "dev_practices_debugging",
        "type": "scenario",
        "difficulty": "intermediate",
        "questionText": "A developer accidentally committed a `.env` file containing local API secrets into Git history 3 commits ago. What is the proper remediation?",
        "options": [
            {
                "text": "Immediately rotate/revoke all exposed credentials, remove the file from history using git filter-repo or BFG, add `.env` to `.gitignore`, and force push.",
                "score": 100,
                "isCorrect": True,
                "weight": {"cybersecurity-analyst": 10, "devops-engineer": 10, "software-developer": 9},
            },
            {
                "text": "Simply delete the `.env` file in a new commit and leave the old commits as is.",
                "score": 35,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Change the file extension from `.env` to `.txt`.",
                "score": 15,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Turn off two-factor authentication on all server accounts.",
                "score": 10,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_db_4",
        "dimension": "databases",
        "type": "code_reading",
        "difficulty": "intermediate",
        "language": "sql",
        "codeSnippet": "SELECT department_id, AVG(salary) AS avg_sal\nFROM employees\nWHERE status = 'ACTIVE'\nGROUP BY department_id\nHAVING AVG(salary) > 80000;",
        "questionText": "What is the structural distinction between the `WHERE` and `HAVING` clauses in this SQL query?",
        "options": [
            {
                "text": "`WHERE` filters individual rows prior to grouping; `HAVING` filters aggregated groups after the GROUP BY execution.",
                "score": 100,
                "isCorrect": True,
                "weight": {"database-developer": 10, "data-analyst": 10, "backend-developer": 9},
            },
            {
                "text": "`WHERE` and `HAVING` are interchangeable aliases with identical execution order.",
                "score": 30,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "`HAVING` can only be used with primary key columns.",
                "score": 25,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "`WHERE` executes after table sorting is completely finished.",
                "score": 20,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_sys_4",
        "dimension": "system_design",
        "type": "multiple_choice",
        "difficulty": "intermediate",
        "questionText": "What is the core distinction between horizontal scaling (scaling out) and vertical scaling (scaling up)?",
        "options": [
            {
                "text": "Horizontal scaling adds more machine instances to distribute the load across a cluster; vertical scaling upgrades CPU/RAM on a single machine instance.",
                "score": 100,
                "isCorrect": True,
                "weight": {"cloud-engineer": 10, "backend-developer": 9, "software-developer": 9},
            },
            {
                "text": "Vertical scaling allows unlimited infinite growth without hardware limits.",
                "score": 30,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Horizontal scaling requires rewriting all application code in assembly language.",
                "score": 15,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Horizontal scaling only works with static HTML files.",
                "score": 20,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_comm_3",
        "dimension": "communication",
        "type": "scenario",
        "difficulty": "intermediate",
        "questionText": "You realize a complex feature will take 3 days longer than originally estimated for sprint completion. How do you handle this expectation with your team lead?",
        "options": [
            {
                "text": "Raise the delay as early as identified, explain the specific technical blockers encountered, and provide revised delivery options (e.g. descoping or adjusted timeline).",
                "score": 100,
                "isCorrect": True,
                "weight": {"software-developer": 10, "product-manager": 10},
            },
            {
                "text": "Wait until the sprint demo meeting and announce that the feature is not ready.",
                "score": 20,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Silently skip testing and remove error handling so code can be merged on time.",
                "score": 25,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Blame another teammate for distracting you.",
                "score": 10,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_learn_3",
        "dimension": "learning_agility",
        "type": "scenario",
        "difficulty": "intermediate",
        "questionText": "Following a production downtime incident, your engineering team conducts a blameless post-mortem. What is the constructive goal of this session?",
        "options": [
            {
                "text": "Identify systemic vulnerabilities, timeline of failure, and actionable preventive engineering safeguards without individual finger-pointing.",
                "score": 100,
                "isCorrect": True,
                "weight": {"devops-engineer": 10, "software-developer": 10, "cloud-engineer": 9},
            },
            {
                "text": "Determine which engineer should be assigned salary penalties.",
                "score": 10,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Delete server logs to prevent external audits.",
                "score": 10,
                "isCorrect": False,
                "weight": {},
            },
            {
                "text": "Decide never to ship updates to production again.",
                "score": 15,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_proj_3",
        "dimension": "practical_projects",
        "type": "self_assessment",
        "difficulty": "foundational",
        "questionText": "What level of experience do you have with automated deployments and cloud platforms (e.g. Vercel, Render, AWS, Docker)?",
        "options": [
            {
                "text": "Hands-on: I have configured Docker, CI/CD pipelines, and deployed live publicly accessible applications.",
                "score": 95,
                "isCorrect": False,
                "weight": {"cloud-engineer": 10, "devops-engineer": 10, "full-stack-developer": 9},
            },
            {
                "text": "Familiar: Deployed projects using one-click hosting platforms (Vercel/Netlify/Render).",
                "score": 75,
                "isCorrect": False,
                "weight": {"frontend-developer": 8, "full-stack-developer": 8},
            },
            {
                "text": "Local Only: Run applications exclusively on localhost.",
                "score": 45,
                "isCorrect": False,
                "weight": {"software-developer": 5},
            },
            {
                "text": "None: Have not yet deployed any code to an external server.",
                "score": 25,
                "isCorrect": False,
                "weight": {},
            },
        ],
    },
    {
        "id": "q_pref_3",
        "dimension": "career_preferences",
        "type": "career_preference",
        "difficulty": "foundational",
        "questionText": "What type of product architecture do you find most intellectually rewarding?",
        "options": [
            {
                "text": "High-throughput transactional APIs, microservices, and relational database schemas.",
                "score": 90,
                "isCorrect": False,
                "weight": {"backend-developer": 10, "software-developer": 9, "java-developer": 9},
            },
            {
                "text": "Fluid interactive user interfaces, design systems, and client-side web applications.",
                "score": 90,
                "isCorrect": False,
                "weight": {"frontend-developer": 10, "full-stack-developer": 8},
            },
            {
                "text": "Scalable cloud orchestration, distributed caching, and zero-downtime infrastructure.",
                "score": 90,
                "isCorrect": False,
                "weight": {"cloud-engineer": 10, "devops-engineer": 10},
            },
            {
                "text": "Predictive algorithms, machine learning models, and deep data analytics pipelines.",
                "score": 90,
                "isCorrect": False,
                "weight": {"data-scientist": 10, "ai-engineer": 10},
            },
        ],
    },
]

# Aliased for backward compatibility with existing tests
ASSESSMENT_QUESTIONS = ADAPTIVE_QUESTION_BANK

# ----------------------------------------------------
# Practical Skill Validation Challenges
# ----------------------------------------------------
SKILL_VALIDATION_CHALLENGES = {
    "dev_practices_debugging": {
        "id": "chal_debug_1",
        "dimension": "dev_practices_debugging",
        "title": "Production Bug Root Cause Analysis",
        "scenario": "A pagination endpoint `/api/items?page=1&limit=10` is missing the 10th item for every page request.",
        "language": "python",
        "codeSnippet": "def get_page(items, page, limit):\n    # BUG INVESTIGATION:\n    start = (page - 1) * limit\n    end = start + limit - 1  # Line 4\n    return items[start:end]",
        "taskDescription": "Identify why the 10th item is omitted and select the correct fix.",
        "options": [
            {
                "text": "Python slice `items[start:end]` is exclusive of `end`. Line 4 should be `end = start + limit`.",
                "isCorrect": True,
                "explanation": "Correct! Python slicing `[start:end]` excludes the upper bound. Subtracting 1 cuts off the final element."
            },
            {
                "text": "Line 3 is wrong: `start` must be `page * limit`.",
                "isCorrect": False,
                "explanation": "Incorrect. For page 1, `(1 - 1) * 10 = 0`, which is the correct 0-indexed start."
            },
            {
                "text": "Items list must be reversed before slicing.",
                "isCorrect": False,
                "explanation": "Incorrect. Reversing the list corrupts sorting order."
            },
        ],
    },
    "databases": {
        "id": "chal_db_1",
        "dimension": "databases",
        "title": "SQL Query Optimization Diagnostic",
        "scenario": "A query filtering by `status` and sorting by `created_at` on an orders table is triggering a sequential table scan across 2M rows.",
        "language": "sql",
        "codeSnippet": "EXPLAIN ANALYZE\nSELECT id, total_amount, created_at\nFROM orders\nWHERE status = 'COMPLETED'\nORDER BY created_at DESC\nLIMIT 20;",
        "taskDescription": "Which composite index eliminates the full table scan and in-memory sort?",
        "options": [
            {
                "text": "CREATE INDEX idx_orders_status_created ON orders (status, created_at DESC);",
                "isCorrect": True,
                "explanation": "Correct! A composite index on `(status, created_at DESC)` allows the database engine to perform an index seek on status and stream pre-ordered rows."
            },
            {
                "text": "CREATE INDEX idx_orders_total ON orders (total_amount);",
                "isCorrect": False,
                "explanation": "Incorrect. `total_amount` is not part of the WHERE or ORDER BY clauses."
            },
            {
                "text": "Convert the `orders` table into an in-memory JSON document.",
                "isCorrect": False,
                "explanation": "Incorrect. Unindexed JSON documents still require full scans."
            },
        ],
    },
    "dsa": {
        "id": "chal_dsa_1",
        "dimension": "dsa",
        "title": "Optimal Data Structure Selection",
        "scenario": "You are processing a live stream of millions of temperature readings and must report the top 5 highest temperatures at any moment in real time.",
        "language": "python",
        "codeSnippet": "# Space & Time Constraints: Real-Time Stream\ndef process_stream(stream):\n    # Which data structure maintains top K elements efficiently?",
        "taskDescription": "What is the optimal data structure to maintain top K elements in O(log k) insertion time?",
        "options": [
            {
                "text": "Min-Heap of size K (root holds current K-th highest; discard elements smaller than root)",
                "isCorrect": True,
                "explanation": "Correct! A Min-Heap of size K provides O(log K) insertion time and O(K) space, keeping the K-th largest at the root."
            },
            {
                "text": "Sort the entire stream array from scratch after every incoming temperature reading.",
                "score": 30,
                "isCorrect": False,
                "explanation": "Incorrect. Re-sorting the whole array takes O(N log N) per item, which is computationally prohibitive."
            },
            {
                "text": "A standard FIFO Queue.",
                "isCorrect": False,
                "explanation": "Incorrect. A FIFO queue tracks insertion order, not numerical maximums."
            },
        ],
    },
    "problem_solving": {
        "id": "chal_prob_1",
        "dimension": "problem_solving",
        "title": "API Idempotency & Concurrency Safeguard",
        "scenario": "When a network timeout occurs during payment processing, clients retry requests. Some users are getting double-charged.",
        "language": "system_design",
        "codeSnippet": "POST /api/v1/payments/charge\nHeader: Idempotency-Key: <unique-uuid-v4>\nBody: { amount: 50.00, customer_id: 'cust_123' }",
        "taskDescription": "How should the backend use the Idempotency-Key header to prevent duplicate charges?",
        "options": [
            {
                "text": "Store the Idempotency-Key in an atomic cache/database. If key already exists and succeeded, return the cached result immediately without charging again.",
                "isCorrect": True,
                "explanation": "Correct! Atomic deduplication on the unique Idempotency-Key prevents duplicate processing."
            },
            {
                "text": "Ignore the header and charge the credit card whenever a request arrives.",
                "isCorrect": False,
                "explanation": "Incorrect. This causes duplicate charges on network retries."
            },
            {
                "text": "Ask the user never to click pay more than once.",
                "isCorrect": False,
                "explanation": "Incorrect. Network timeouts trigger automated browser or gateway retries outside user control."
            },
        ],
    },
}

def select_next_adaptive_question(
    answered_ids: list,
    current_answers: list,
    target_role: str = "software-developer",
    min_questions: int = 10,
    max_questions: int = 14
) -> dict:
    """
    Selects the next adaptive question based on:
    1. Unanswered questions.
    2. Difficulty adjustment (if last 2 technical questions scored >= 75%, promote difficulty; if < 60%, provide diagnostic/foundational).
    3. Balancing dimensions (favors dimensions with low evidence coverage that are relevant to target_role).
    4. Concludes assessment when sufficient evidence (min_questions reached and core dimensions evaluated).
    """
    answered_set = set(answered_ids)
    remaining_questions = [q for q in ADAPTIVE_QUESTION_BANK if q["id"] not in answered_set]

    # Count evidence by dimension
    dimension_counts = {}
    technical_scores = []
    for ans in current_answers:
        dim = ans.get("dimension") or "problem_solving"
        dimension_counts[dim] = dimension_counts.get(dim, 0) + 1
        if ans.get("score") is not None and dim in [
            "problem_solving", "programming_fundamentals", "dsa", "dev_practices_debugging", "databases", "system_design"
        ]:
            technical_scores.append(ans["score"])

    # Determine current performance level
    recent_scores = technical_scores[-3:] if len(technical_scores) >= 3 else technical_scores
    avg_recent = sum(recent_scores) / max(1, len(recent_scores)) if recent_scores else 75

    target_difficulty = "foundational"
    if avg_recent >= 85:
        target_difficulty = "advanced"
    elif avg_recent >= 65:
        target_difficulty = "intermediate"

    # Check if assessment has sufficient coverage to finish
    core_dimensions = ["problem_solving", "programming_fundamentals", "dsa", "dev_practices_debugging", "databases"]
    core_evaluated = sum(1 for d in core_dimensions if dimension_counts.get(d, 0) >= 1)

    can_conclude = len(answered_set) >= min_questions and core_evaluated >= 4
    if len(answered_set) >= max_questions or not remaining_questions:
        return {
            "hasMore": False,
            "nextQuestion": None,
            "canConclude": True,
            "progressPercent": 100,
            "currentQuestionNumber": len(answered_set),
            "totalQuestionsTarget": len(answered_set),
        }

    # Prioritize dimensions with zero evidence
    unrepresented_dims = [d for d in DIMENSIONS.keys() if dimension_counts.get(d, 0) == 0]
    
    # Filter candidates
    candidates = []
    if unrepresented_dims:
        candidates = [q for q in remaining_questions if q["dimension"] in unrepresented_dims]

    if not candidates:
        # Filter by target difficulty
        difficulty_candidates = [q for q in remaining_questions if q["difficulty"] == target_difficulty]
        candidates = difficulty_candidates if difficulty_candidates else remaining_questions

    # Pick best candidate
    selected = candidates[0] if candidates else remaining_questions[0]

    return {
        "hasMore": True,
        "nextQuestion": selected,
        "canConclude": can_conclude,
        "progressPercent": min(95, int((len(answered_set) / max_questions) * 100)),
        "currentQuestionNumber": len(answered_set) + 1,
        "totalQuestionsTarget": max_questions,
    }


def evaluate_adaptive_assessment(answers: list, target_role: str, career_catalog: list) -> dict:
    """
    Computes a comprehensive multi-dimensional scorecard, top 3 evidence-based career matches,
    an actionable improvement plan, and a skill validation challenge.
    """
    dim_scores = {}
    dim_counts = {}
    career_weights = {}

    for ans in answers:
        q_id = ans.get("questionId")
        q = next((item for item in ADAPTIVE_QUESTION_BANK if item["id"] == q_id), None)
        if not q:
            continue

        selected_text = ans.get("selectedOption")
        opt = next((o for o in q["options"] if o["text"] == selected_text), None)
        score = opt["score"] if opt else 70

        dim = q["dimension"]
        dim_scores[dim] = dim_scores.get(dim, 0) + score
        dim_counts[dim] = dim_counts.get(dim, 0) + 1

        if opt and "weight" in opt:
            for c_slug, wt in opt["weight"].items():
                career_weights[c_slug] = career_weights.get(c_slug, 0) + wt

    # Normalize dimension scores (0-100)
    normalized_dimensions = {}
    for dim_key, meta in DIMENSIONS.items():
        if dim_counts.get(dim_key, 0) > 0:
            normalized_dimensions[dim_key] = {
                "id": dim_key,
                "title": meta["title"],
                "category": meta["category"],
                "score": int(round(dim_scores[dim_key] / dim_counts[dim_key])),
                "evidenceCount": dim_counts[dim_key],
                "evaluated": True,
                "isObjective": meta["isObjective"],
            }
        else:
            normalized_dimensions[dim_key] = {
                "id": dim_key,
                "title": meta["title"],
                "category": meta["category"],
                "score": 0,
                "evidenceCount": 0,
                "evaluated": False,
                "isObjective": meta["isObjective"],
            }

    # Separate Demonstrated Technical Knowledge vs Self-Reported vs Collaboration
    tech_dims = ["problem_solving", "programming_fundamentals", "dsa", "dev_practices_debugging", "databases", "system_design"]
    evaluated_tech_scores = [normalized_dimensions[d]["score"] for d in tech_dims if normalized_dimensions[d]["evaluated"]]
    demonstrated_technical_score = int(round(sum(evaluated_tech_scores) / max(1, len(evaluated_tech_scores)))) if evaluated_tech_scores else 70

    collab_dims = ["communication", "learning_agility"]
    evaluated_collab_scores = [normalized_dimensions[d]["score"] for d in collab_dims if normalized_dimensions[d]["evaluated"]]
    collaboration_score = int(round(sum(evaluated_collab_scores) / max(1, len(evaluated_collab_scores)))) if evaluated_collab_scores else 75

    project_score = normalized_dimensions["practical_projects"]["score"] if normalized_dimensions["practical_projects"]["evaluated"] else 60

    # Composite Overall Score (Weighted)
    overall_score = int(round(
        (0.50 * demonstrated_technical_score) +
        (0.20 * collaboration_score) +
        (0.15 * project_score) +
        (0.15 * min(90, max(50, demonstrated_technical_score + 5)))
    ))

    # Evidence coverage
    evaluated_count = sum(1 for d in normalized_dimensions.values() if d["evaluated"])
    evidence_coverage_percent = int((evaluated_count / len(DIMENSIONS)) * 100)

    # Readiness Tier
    if overall_score >= 82:
        tier = "Market-Competitive Ready"
    elif overall_score >= 68:
        tier = "Industry Competitive Candidate"
    elif overall_score >= 50:
        tier = "Developing Foundation"
    else:
        tier = "Early Foundational Stage"

    # Identify Strengths & Growth Areas
    sorted_dims = sorted(
        [d for d in normalized_dimensions.values() if d["evaluated"] and d["isObjective"]],
        key=lambda x: x["score"],
        reverse=True
    )
    strongest_skills = [f"{d['title']} ({d['score']}%)" for d in sorted_dims[:3]]
    weakest_skills = [f"{d['title']} ({d['score']}%)" for d in sorted_dims[-3:]]

    # Calculate Evidence-Based Career Matching (Top 3)
    career_catalog_map = {c.get("id", c.get("slug")): c for c in career_catalog} if career_catalog else {}
    
    top_careers = []
    # Rank by weights accumulated
    sorted_career_slugs = sorted(career_weights.items(), key=lambda x: x[1], reverse=True)
    if not sorted_career_slugs:
        sorted_career_slugs = [(target_role, 20), ("full-stack-developer", 18), ("backend-developer", 16)]

    for slug, weight in sorted_career_slugs[:3]:
        role_info = career_catalog_map.get(slug) or {}
        role_title = role_info.get("title") or slug.replace("-", " ").title()
        
        # Compatibility score calibrated from demonstrated tech score and role alignment
        compatibility = min(96, max(55, int(overall_score * 0.7 + min(28, weight * 0.6))))
        
        strengths = [s for s in strongest_skills]
        gaps = [w for w in weakest_skills]

        top_careers.append({
            "careerId": slug,
            "title": role_title,
            "compatibilityScore": compatibility,
            "matchRationale": f"Demonstrated high problem-solving capacity ({demonstrated_technical_score}%) with strong alignment to {role_title} requirements.",
            "contributingStrengths": strengths,
            "identifiedGaps": gaps,
        })

    # Pick top skill gap for practical validation challenge
    top_gap_dim_id = sorted_dims[-1]["id"] if sorted_dims else "dev_practices_debugging"
    selected_challenge = SKILL_VALIDATION_CHALLENGES.get(top_gap_dim_id) or SKILL_VALIDATION_CHALLENGES["dev_practices_debugging"]

    # 3-Step Personalized Improvement Plan
    weakest_dim_1 = sorted_dims[-1]["title"] if len(sorted_dims) >= 1 else "Database Optimization"
    weakest_dim_2 = sorted_dims[-2]["title"] if len(sorted_dims) >= 2 else "System Design"
    weakest_dim_3 = sorted_dims[-3]["title"] if len(sorted_dims) >= 3 else "Automated Testing"

    improvement_plan = [
        {
            "priority": 1,
            "skill": weakest_dim_1,
            "recommendation": f"Dedicate 4-6 hours to hands-on exercises in {weakest_dim_1}. Build a localized practical component testing edge cases.",
            "practicalTask": "Implement a localized test module or query plan verification script in your primary project repository.",
            "targetMilestone": "Phase 2 Roadmap Milestone",
            "actionRoute": "/roadmap"
        },
        {
            "priority": 2,
            "skill": weakest_dim_2,
            "recommendation": f"Study production patterns in {weakest_dim_2}. Review industry architectural trade-offs.",
            "practicalTask": "Refactor a service endpoint to implement proper caching, indexing, or error boundaries.",
            "targetMilestone": "Phase 3 Capstone Preparation",
            "actionRoute": "/learning"
        },
        {
            "priority": 3,
            "skill": weakest_dim_3,
            "recommendation": f"Reinforce core principles in {weakest_dim_3} through mock technical interview rehearsals.",
            "practicalTask": "Complete a 5-question technical interview session focusing on conceptual clarity.",
            "targetMilestone": "Interview Arena Verification",
            "actionRoute": "/interview"
        },
    ]

    return {
        "overallScore": overall_score,
        "demonstratedTechnicalScore": demonstrated_technical_score,
        "collaborationScore": collaboration_score,
        "projectMaturityScore": project_score,
        "tier": tier,
        "evidenceCoveragePercent": evidence_coverage_percent,
        "evaluatedSignalsCount": len(answers),
        "dimensionScores": normalized_dimensions,
        "strongestSkills": strongest_skills,
        "weakestSkills": weakest_skills,
        "topCareerMatches": top_careers,
        "skillValidationChallenge": selected_challenge,
        "improvementPlan": improvement_plan,
        "disclaimer": "This score is a developmental assessment estimate designed to highlight learning priorities, not a commercial hiring guarantee.",
    }
