// Ultimate HTML Testbook Question Extractor - Preserves Solution & Comprehension HTML
// This script extracts questions and options as text, but preserves solution and comprehension HTML formatting

console.log('🚀 Starting Ultimate HTML Testbook Question Extractor...');

class UltimateHTMLTestbookExtractor {
    constructor() {
        this.testData = null;
        this.scope = null;
        this.answers = null;
        this.allQuestions = [];
        this.languages = ['en', 'hn'];
        this.errors = [];
        this.warnings = [];
        this.stats = {
            totalQuestions: 0,
            successfulExtractions: 0,
            partialExtractions: 0,
            failedExtractions: 0,
            missingEnglish: 0,
            missingHindi: 0,
            missingOptions: 0,
            missingCorrectAnswers: 0,
            missingSolutions: 0,
            foundCorrectAnswers: 0,
            foundSolutions: 0,
            foundComprehensions: 0,
            missingComprehensions: 0,
            comprehensionQuestions: 0
        };
    }

    // Enhanced initialization with Angular scope and answers data
    init() {
        console.log('🔍 Searching for test data, Angular scope, and answers...');
        
        const strategies = [
            // Strategy 1: Direct window access
            {
                name: 'Window objects',
                fn: () => ({
                    test: window.test,
                    scope: this.findAngularScope(),
                    answers: window.answers || this.findAnswersData()
                })
            },
            // Strategy 2: Angular scope from document body
            {
                name: 'Angular body scope',
                fn: () => {
                    const scope = angular.element(document.body).scope();
                    return {
                        test: scope?.test,
                        scope: scope,
                        answers: scope?.answers || this.findAnswersData()
                    };
                }
            },
            // Strategy 3: Deep Angular scope search
            {
                name: 'Deep Angular scope search',
                fn: () => {
                    const scope = this.findAngularScope();
                    return {
                        test: scope?.test,
                        scope: scope,
                        answers: scope?.answers || this.findAnswersData()
                    };
                }
            }
        ];

        for (let strategy of strategies) {
            try {
                console.log(`  📍 Trying: ${strategy.name}...`);
                const result = strategy.fn();
                
                if (this.validateAndSetData(result)) {
                    console.log(`✅ Data found using: ${strategy.name}`);
                    this.logTestInfo();
                    return true;
                }
            } catch (e) {
                console.warn(`  ⚠️ ${strategy.name} failed:`, e.message);
            }
        }
        
        console.error('❌ Could not find valid test data with any strategy');
        return false;
    }

    // Find Angular scope with test methods
    findAngularScope() {
        const elements = document.querySelectorAll('[ng-controller], [ng-app], .ng-scope');
        for (let elem of elements) {
            try {
                const scope = angular.element(elem).scope();
                if (scope && (scope.getQuestionDesc || scope.test || scope.getSolutionDesc)) {
                    return scope;
                }
            } catch (e) {
                // Continue searching
            }
        }
        return null;
    }

    // Find answers data in various locations
    findAnswersData() {
        const possiblePaths = [
            () => window.answers,
            () => window.testData?.answers,
            () => this.scope?.answers,
            () => this.scope?.$parent?.answers,
            () => this.scope?.$root?.answers,
            () => this.testData?.answers
        ];

        for (let getAnswers of possiblePaths) {
            try {
                const answers = getAnswers();
                if (answers && typeof answers === 'object') {
                    return answers;
                }
            } catch (e) {
                // Continue searching
            }
        }
        return null;
    }

    // Validate and set the found data
    validateAndSetData(result) {
        if (!result.test || !result.test.sections) {
            return false;
        }

        this.testData = result.test;
        this.scope = result.scope;
        this.answers = result.answers;

        // Validate test data structure
        if (!Array.isArray(this.testData.sections) || this.testData.sections.length === 0) {
            return false;
        }

        // Count total questions
        let totalQuestions = 0;
        for (let section of this.testData.sections) {
            if (section.questions && Array.isArray(section.questions)) {
                totalQuestions += section.questions.length;
            }
        }

        if (totalQuestions === 0) {
            return false;
        }

        console.log(`✅ Validation passed: ${this.testData.sections.length} sections, ${totalQuestions} total questions`);
        console.log(`📊 Angular scope methods: ${this.scope ? 'Available' : 'Not found'}`);
        console.log(`📊 Answers data: ${this.answers ? 'Available' : 'Not found'}`);

        // Test scope methods
        if (this.scope) {
            console.log(`📊 Scope methods available:`);
            const methods = ['getQuestionDesc', 'getOptions', 'getSolutionDesc', 'isCorrectOption'];
            methods.forEach(method => {
                console.log(`   ${method}: ${this.scope[method] ? 'Yes' : 'No'}`);
            });
        }

        return true;
    }

    // Log test information
    logTestInfo() {
        console.log('📊 Test Information:');
        console.log(`   Title: ${this.testData.title || 'N/A'}`);
        console.log(`   ID: ${this.testData._id || 'N/A'}`);
        console.log(`   Course: ${this.testData.course || 'N/A'}`);
        console.log(`   Total Questions: ${this.testData.totalQuestions || 'N/A'}`);
        console.log(`   Sections: ${this.testData.sections.length}`);
        
        this.testData.sections.forEach((section, index) => {
            const questionCount = section.questions ? section.questions.length : 0;
            console.log(`     Section ${index + 1}: "${section.title}" (${questionCount} questions)`);
        });
    }

    // Enhanced question text extraction - PRESERVES HTML
    getQuestionHTML(sectionIndex, questionIndex, lang) {
        const context = `S${sectionIndex+1}Q${questionIndex+1}`;
        
        try {
            // Try Angular scope method first - returns raw HTML
            if (this.scope && this.scope.getQuestionDesc) {
                try {
                    const questionHTML = this.scope.getQuestionDesc(sectionIndex + 1, questionIndex + 1, lang);
                    if (questionHTML && questionHTML.trim().length > 0) {
                        return this.sanitizeHTML(questionHTML);
                    }
                } catch (e) {
                    console.warn(`${context}: Angular scope method failed for ${lang}:`, e.message);
                }
            }

            // Fallback to direct data access
            const question = this.testData.sections[sectionIndex]?.questions[questionIndex];
            if (!question) {
                this.logWarning(`${context}: Question object not found`);
                return '<p>Question not found</p>';
            }

            // Try primary language
            if (question[lang]?.value) {
                const html = this.sanitizeHTML(question[lang].value);
                if (html && html.trim().length > 0) {
                    return html;
                }
            }

            // Try fallback language
            const otherLang = lang === 'en' ? 'hn' : 'en';
            if (question[otherLang]?.value) {
                const html = this.sanitizeHTML(question[otherLang].value);
                if (html && html.trim().length > 0) {
                    this.logWarning(`${context}: Using ${otherLang} fallback for question text`);
                    return html;
                }
            }

            return '<p>Question text not available</p>';
            
        } catch (e) {
            this.logError(`${context}: Exception getting question text`, e);
            return '<p>Error extracting question text</p>';
        }
    }

    // Enhanced options extraction - PRESERVES HTML
    getQuestionOptionsHTML(sectionIndex, questionIndex, lang) {
        const context = `S${sectionIndex+1}Q${questionIndex+1}`;
        
        try {
            let options = [];

            // Try Angular scope method first
            if (this.scope && this.scope.getOptions) {
                try {
                    options = this.scope.getOptions(sectionIndex + 1, questionIndex + 1, lang) || [];
                    if (options.length > 0) {
                        return this.processOptionsHTML(options, context);
                    }
                } catch (e) {
                    console.warn(`${context}: Angular scope getOptions failed for ${lang}:`, e.message);
                }
            }

            // Fallback to direct data access
            const question = this.testData.sections[sectionIndex]?.questions[questionIndex];
            if (!question) {
                this.logWarning(`${context}: Question object not found`);
                return [];
            }

            // Try primary language
            if (question[lang]?.options && Array.isArray(question[lang].options)) {
                options = question[lang].options;
            } else {
                // Try fallback language
                const otherLang = lang === 'en' ? 'hn' : 'en';
                if (question[otherLang]?.options && Array.isArray(question[otherLang].options)) {
                    options = question[otherLang].options;
                    this.logWarning(`${context}: Using ${otherLang} fallback for options`);
                }
            }

            return this.processOptionsHTML(options, context);
            
        } catch (e) {
            this.logError(`${context}: Exception getting options`, e);
            return [];
        }
    }

    // Process options with HTML preservation
    processOptionsHTML(options, context) {
        if (options.length === 0) {
            this.logWarning(`${context}: No options found`);
            return [];
        }

        return options.map((option, index) => {
            const label = String.fromCharCode(65 + index); // A, B, C, D
            const html = this.sanitizeHTML(option.value || option.text || option.prompt || '');
            const prompt = option.prompt || option.id || `option${index+1}`;

            if (!html || html.trim().length === 0) {
                this.logWarning(`${context}: Empty option ${label}`);
            }

            return {
                label,
                html: html || `<p>Option ${label} (no content)</p>`,
                prompt,
                originalData: option
            };
        });
    }

    // Improved correct answer detection using multiple methods
    getCorrectAnswer(sectionIndex, questionIndex) {
        const context = `S${sectionIndex+1}Q${questionIndex+1}`;
        
        try {
            // Strategy 1: Look for correct answer in question data directly
            const question = this.testData.sections[sectionIndex]?.questions[questionIndex];
            if (question) {
                // Check for correctOption property
                if (question.correctOption) {
                    const options = this.getQuestionOptionsHTML(sectionIndex, questionIndex, 'en');
                    const correctOption = options.find(opt => opt.prompt === question.correctOption);
                    if (correctOption) {
                        this.stats.foundCorrectAnswers++;
                        return correctOption.label;
                    }
                }

                // Check for correct flag in options
                const enOptions = question.en?.options || [];
                const correctIndex = enOptions.findIndex(opt => opt.correct === true || opt.isCorrect === true);
                if (correctIndex !== -1) {
                    this.stats.foundCorrectAnswers++;
                    return String.fromCharCode(65 + correctIndex);
                }

                // Check Hindi options as fallback
                const hnOptions = question.hn?.options || [];
                const correctIndexHn = hnOptions.findIndex(opt => opt.correct === true || opt.isCorrect === true);
                if (correctIndexHn !== -1) {
                    this.stats.foundCorrectAnswers++;
                    return String.fromCharCode(65 + correctIndexHn);
                }
            }

            // Strategy 2: Try Angular scope isCorrectOption method with proper context
            if (this.scope && this.scope.isCorrectOption) {
                try {
                    // Set current question context
                    this.setCurrentQuestionContext(sectionIndex, questionIndex);
                    
                    const options = this.getQuestionOptionsHTML(sectionIndex, questionIndex, 'en');
                    for (let i = 0; i < options.length; i++) {
                        const option = options[i];
                        if (this.scope.isCorrectOption(option.originalData)) {
                            this.stats.foundCorrectAnswers++;
                            return option.label;
                        }
                    }
                } catch (e) {
                    console.warn(`${context}: Angular isCorrectOption failed:`, e.message);
                }
            }

            // Strategy 3: Try answers data lookup
            if (this.answers) {
                try {
                    const questionId = this.getQuestionId(sectionIndex, questionIndex);
                    if (questionId && this.answers[questionId]) {
                        const answerData = this.answers[questionId];
                        if (answerData.correctOption) {
                            const options = this.getQuestionOptionsHTML(sectionIndex, questionIndex, 'en');
                            const correctOption = options.find(opt => opt.prompt === answerData.correctOption);
                            if (correctOption) {
                                this.stats.foundCorrectAnswers++;
                                return correctOption.label;
                            }
                        }
                    }
                } catch (e) {
                    console.warn(`${context}: Answers data lookup failed:`, e.message);
                }
            }

            this.stats.missingCorrectAnswers++;
            return 'Not available';
            
        } catch (e) {
            this.logError(`${context}: Exception getting correct answer`, e);
            return 'Error';
        }
    }

    // Set current question context in Angular scope
    setCurrentQuestionContext(sectionIndex, questionIndex) {
        if (!this.scope) return;

        try {
            // Set currentQuestion context
            if (!this.scope.currentQuestion) {
                this.scope.currentQuestion = {};
            }
            
            this.scope.currentQuestion.sSNo = sectionIndex + 1;
            this.scope.currentQuestion.qSNo = questionIndex + 1;

            // Set lang context if available
            if (this.scope.$root && !this.scope.$root.lang) {
                this.scope.$root.lang = { name: 'en' };
            }

            // Apply scope changes
            if (this.scope.$apply) {
                this.scope.$apply();
            }
        } catch (e) {
            console.warn('Failed to set question context:', e.message);
        }
    }

    // Improved solution extraction with HTML preservation
    getSolutionHTML(sectionIndex, questionIndex, lang) {
        const context = `S${sectionIndex+1}Q${questionIndex+1}`;
        
        try {
            // Strategy 1: Try Angular scope method with proper context (MOST IMPORTANT)
            if (this.scope && this.scope.getSolutionDesc) {
                try {
                    // Set proper context for the solution
                    this.setCurrentQuestionContext(sectionIndex, questionIndex);
                    
                    // Set language context
                    if (this.scope.$root) {
                        if (!this.scope.$root.lang) {
                            this.scope.$root.lang = {};
                        }
                        this.scope.$root.lang.name = lang;
                    }

                    // Call getSolutionDesc with the same parameters as the HTML
                    const solutionHTML = this.scope.getSolutionDesc(sectionIndex + 1, questionIndex + 1, lang);
                    
                    if (solutionHTML && solutionHTML.trim().length > 0 && 
                        solutionHTML !== 'undefined' && solutionHTML !== 'null' && 
                        solutionHTML !== 'Solution not available') {
                        this.stats.foundSolutions++;
                        return this.sanitizeHTML(solutionHTML);
                    }
                } catch (e) {
                    console.warn(`${context}: Angular getSolutionDesc failed for ${lang}:`, e.message);
                }
            }

            // Strategy 2: Try direct data access for solutions
            const question = this.testData.sections[sectionIndex]?.questions[questionIndex];
            if (question) {
                // Check for solution in language data
                if (question[lang]?.sol?.value) {
                    this.stats.foundSolutions++;
                    return this.sanitizeHTML(question[lang].sol.value);
                }

                // Check for solution property directly
                if (question[lang]?.solution) {
                    this.stats.foundSolutions++;
                    return this.sanitizeHTML(question[lang].solution);
                }

                // Check fallback language
                const otherLang = lang === 'en' ? 'hn' : 'en';
                if (question[otherLang]?.sol?.value) {
                    this.stats.foundSolutions++;
                    return this.sanitizeHTML(question[otherLang].sol.value);
                }

                if (question[otherLang]?.solution) {
                    this.stats.foundSolutions++;
                    return this.sanitizeHTML(question[otherLang].solution);
                }
            }

            // Strategy 3: Try DOM-based extraction (extract from current HTML)
            try {
                const solutionElement = document.querySelector('.qns-view-box[ng-bind-html*="getSolutionDesc"]');
                if (solutionElement && solutionElement.innerHTML.trim().length > 0) {
                    this.stats.foundSolutions++;
                    return this.sanitizeHTML(solutionElement.innerHTML);
                }
            } catch (e) {
                console.warn(`${context}: DOM extraction failed:`, e.message);
            }

            // Strategy 4: Try answers data
            if (this.answers) {
                try {
                    const questionId = this.getQuestionId(sectionIndex, questionIndex);
                    if (questionId && this.answers[questionId]) {
                        const answerData = this.answers[questionId];
                        
                        // Check for solution in answers
                        if (answerData.sol && answerData.sol[lang] && answerData.sol[lang].value) {
                            this.stats.foundSolutions++;
                            return this.sanitizeHTML(answerData.sol[lang].value);
                        }

                        // Check fallback language in answers
                        const otherLang = lang === 'en' ? 'hn' : 'en';
                        if (answerData.sol && answerData.sol[otherLang] && answerData.sol[otherLang].value) {
                            this.stats.foundSolutions++;
                            return this.sanitizeHTML(answerData.sol[otherLang].value);
                        }

                        // Check for direct solution property
                        if (answerData.solution) {
                            this.stats.foundSolutions++;
                            return this.sanitizeHTML(answerData.solution);
                        }
                    }
                } catch (e) {
                    console.warn(`${context}: Answers solution lookup failed for ${lang}:`, e.message);
                }
            }

            // Strategy 5: Try alternative scope methods
            if (this.scope) {
                const solutionMethods = ['getSolution', 'getExplanation', 'getAnswer'];
                for (let methodName of solutionMethods) {
                    if (this.scope[methodName]) {
                        try {
                            this.setCurrentQuestionContext(sectionIndex, questionIndex);
                            const solutionHTML = this.scope[methodName](sectionIndex + 1, questionIndex + 1, lang);
                            if (solutionHTML && solutionHTML.trim().length > 0 && solutionHTML !== 'undefined') {
                                this.stats.foundSolutions++;
                                return this.sanitizeHTML(solutionHTML);
                            }
                        } catch (e) {
                            // Continue to next method
                        }
                    }
                }
            }

            this.stats.missingSolutions++;
            return '<p>Solution not available</p>';
            
        } catch (e) {
            this.logError(`${context}: Exception getting solution`, e);
            return '<p>Error extracting solution</p>';
        }
    }

    // Enhanced comprehension extraction with HTML preservation
    getComprehensionHTML(sectionIndex, questionIndex, lang) {
        const context = `S${sectionIndex+1}Q${questionIndex+1}`;
        
        try {
            // Strategy 1: Try Angular scope method with proper context
            if (this.scope && this.scope.getComprehensionDesc) {
                try {
                    // Set proper context for the comprehension
                    this.setCurrentQuestionContext(sectionIndex, questionIndex);
                    
                    // Set language context
                    if (this.scope.$root) {
                        if (!this.scope.$root.lang) {
                            this.scope.$root.lang = {};
                        }
                        this.scope.$root.lang.name = lang;
                    }

                    // Call getComprehensionDesc with the same parameters as the HTML
                    const comprehensionHTML = this.scope.getComprehensionDesc(sectionIndex + 1, questionIndex + 1, lang);
                    
                    if (comprehensionHTML && comprehensionHTML.trim().length > 0 && 
                        comprehensionHTML !== 'undefined' && comprehensionHTML !== 'null' && 
                        comprehensionHTML !== 'Comprehension not available') {
                        this.stats.foundComprehensions++;
                        return this.sanitizeHTML(comprehensionHTML);
                    }
                } catch (e) {
                    console.warn(`${context}: Angular getComprehensionDesc failed for ${lang}:`, e.message);
                }
            }

            // Strategy 2: Try direct data access for comprehensions
            const question = this.testData.sections[sectionIndex]?.questions[questionIndex];
            if (question) {
                // Check for comprehension in language data
                if (question[lang]?.comp?.value) {
                    this.stats.foundComprehensions++;
                    return this.sanitizeHTML(question[lang].comp.value);
                }

                // Check for comprehension property directly
                if (question[lang]?.comp) {
                    this.stats.foundComprehensions++;
                    return this.sanitizeHTML(question[lang].comp);
                }

                // Check for comprehension field
                if (question[lang]?.comprehension) {
                    this.stats.foundComprehensions++;
                    return this.sanitizeHTML(question[lang].comprehension);
                }

                // Check fallback language
                const otherLang = lang === 'en' ? 'hn' : 'en';
                if (question[otherLang]?.comp?.value) {
                    this.stats.foundComprehensions++;
                    return this.sanitizeHTML(question[otherLang].comp.value);
                }

                if (question[otherLang]?.comp) {
                    this.stats.foundComprehensions++;
                    return this.sanitizeHTML(question[otherLang].comp);
                }

                if (question[otherLang]?.comprehension) {
                    this.stats.foundComprehensions++;
                    return this.sanitizeHTML(question[otherLang].comprehension);
                }
            }

            // Strategy 3: Try DOM-based extraction (extract from current HTML)
            try {
                const comprehensionElement = document.querySelector('.comprehension-content, .comp-content, [ng-bind-html*="getComprehensionDesc"]');
                if (comprehensionElement && comprehensionElement.innerHTML.trim().length > 0) {
                    this.stats.foundComprehensions++;
                    return this.sanitizeHTML(comprehensionElement.innerHTML);
                }
            } catch (e) {
                console.warn(`${context}: DOM comprehension extraction failed:`, e.message);
            }

            // Strategy 4: Try answers data
            if (this.answers) {
                try {
                    const questionId = this.getQuestionId(sectionIndex, questionIndex);
                    if (questionId && this.answers[questionId]) {
                        const answerData = this.answers[questionId];
                        
                        // Check for comprehension in answers
                        if (answerData.comp && answerData.comp[lang] && answerData.comp[lang].value) {
                            this.stats.foundComprehensions++;
                            return this.sanitizeHTML(answerData.comp[lang].value);
                        }

                        // Check fallback language in answers
                        const otherLang = lang === 'en' ? 'hn' : 'en';
                        if (answerData.comp && answerData.comp[otherLang] && answerData.comp[otherLang].value) {
                            this.stats.foundComprehensions++;
                            return this.sanitizeHTML(answerData.comp[otherLang].value);
                        }

                        // Check for direct comprehension property
                        if (answerData.comprehension) {
                            this.stats.foundComprehensions++;
                            return this.sanitizeHTML(answerData.comprehension);
                        }
                    }
                } catch (e) {
                    console.warn(`${context}: Answers comprehension lookup failed for ${lang}:`, e.message);
                }
            }

            // Strategy 5: Try alternative scope methods
            if (this.scope) {
                const comprehensionMethods = ['getComprehension', 'getPassage', 'getPassageDesc'];
                for (let methodName of comprehensionMethods) {
                    if (this.scope[methodName]) {
                        try {
                            this.setCurrentQuestionContext(sectionIndex, questionIndex);
                            const comprehensionHTML = this.scope[methodName](sectionIndex + 1, questionIndex + 1, lang);
                            if (comprehensionHTML && comprehensionHTML.trim().length > 0 && comprehensionHTML !== 'undefined') {
                                this.stats.foundComprehensions++;
                                return this.sanitizeHTML(comprehensionHTML);
                            }
                        } catch (e) {
                            // Continue to next method
                        }
                    }
                }
            }

            this.stats.missingComprehensions++;
            return null; // Return null instead of a placeholder for comprehensions
            
        } catch (e) {
            this.logError(`${context}: Exception getting comprehension`, e);
            return null;
        }
    }

    // Check if question has comprehension
    hasComprehension(sectionIndex, questionIndex) {
        try {
            const question = this.testData.sections[sectionIndex]?.questions[questionIndex];
            if (!question) return false;

            // Check comprehension indicators
            if (question.singlePageComp || question.isFixedComp || question.fixedCompQuestion) {
                return true;
            }

            // Check for comprehension content in either language
            const hasEnComp = question.en?.comp || question.en?.comprehension;
            const hasHnComp = question.hn?.comp || question.hn?.comprehension;
            
            return !!(hasEnComp || hasHnComp);
        } catch (e) {
            return false;
        }
    }

    // Get question ID
    getQuestionId(sectionIndex, questionIndex) {
        try {
            const question = this.testData.sections[sectionIndex]?.questions[questionIndex];
            return question?._id;
        } catch (e) {
            return null;
        }
    }

    // Sanitize HTML (removes only dangerous scripts but preserves formatting)
    sanitizeHTML(html) {
        if (!html) return '';
        
        try {
            if (typeof html !== 'string') {
                html = String(html);
            }

            // Create a temporary element to clean dangerous content
            const temp = document.createElement('div');
            temp.innerHTML = html;
            
            // Remove only dangerous elements but keep formatting
            const dangerousSelectors = ['script', 'iframe', 'object', 'embed'];
            dangerousSelectors.forEach(selector => {
                const elements = temp.querySelectorAll(selector);
                elements.forEach(el => el.remove());
            });
            
            // Return sanitized HTML with formatting preserved
            return temp.innerHTML;
            
        } catch (e) {
            console.warn('Error sanitizing HTML:', e.message);
            return html;
        }
    }

    // Convert HTML to plain text for console display
    htmlToText(html) {
        if (!html) return '';
        
        try {
            const temp = document.createElement('div');
            temp.innerHTML = html;
            let text = temp.textContent || temp.innerText || '';
            return text.replace(/\s+/g, ' ').trim();
        } catch (e) {
            return html;
        }
    }

    // Enhanced extraction with HTML preservation
    extractAllQuestions() {
        if (!this.testData || !this.testData.sections) {
            console.error('❌ Cannot extract: invalid test data');
            return;
        }

        console.log('\n🚀 Starting ultimate HTML data extraction...\n');

        let questionNumber = 1;

        this.testData.sections.forEach((section, sectionIndex) => {
            this.logSectionStart(section, sectionIndex);

            if (!section.questions || !Array.isArray(section.questions)) {
                this.logWarning(`Section ${sectionIndex + 1}: No questions array found`);
                return;
            }

            section.questions.forEach((question, questionIndex) => {
                try {
                    this.extractSingleQuestion(
                        question,
                        questionNumber,
                        sectionIndex,
                        questionIndex,
                        section.title
                    );
                    questionNumber++;
                } catch (error) {
                    this.logError(`Question ${questionNumber}: Critical extraction error`, error);
                    this.stats.failedExtractions++;
                    questionNumber++;
                }
            });
        });

        this.logFinalResults();
    }

    // Extract a single question with all data in HTML format
    extractSingleQuestion(question, questionNumber, sectionIndex, questionIndex, sectionTitle) {
        const context = `Q${questionNumber}`;
        
        console.log(`\n📝 ${context} (Section ${sectionIndex + 1}, Question ${questionIndex + 1})`);
        console.log('-'.repeat(50));

        if (!question || typeof question !== 'object') {
            this.logError(`${context}: Invalid question object`);
            this.stats.failedExtractions++;
            return;
        }

        // Show debugging info
        this.logQuestionDebugInfo(question, context);

        // Set current question context for the entire extraction
        this.setCurrentQuestionContext(sectionIndex, questionIndex);

        // Extract data for both languages in HTML format
        const extractionResults = {};
        let hasAnyData = false;

        // Check if this question has comprehension
        const hasComprehension = this.hasComprehension(sectionIndex, questionIndex);
        if (hasComprehension) {
            this.stats.comprehensionQuestions++;
            console.log(`📖 Comprehension question detected`);
        }

        this.languages.forEach(lang => {
            const langName = lang === 'en' ? 'English' : 'Hindi';
            console.log(`\n🌐 ${langName} (${lang}):`);

            const questionHTML = this.getQuestionHTML(sectionIndex, questionIndex, lang);
            const optionsHTML = this.getQuestionOptionsHTML(sectionIndex, questionIndex, lang);
            const solutionHTML = this.getSolutionHTML(sectionIndex, questionIndex, lang);
            const comprehensionHTML = hasComprehension ? this.getComprehensionHTML(sectionIndex, questionIndex, lang) : null;

            extractionResults[lang] = {
                // Exclude questionHTML and optionsHTML as requested
                // questionHTML: questionHTML,
                // optionsHTML: optionsHTML,
                solutionHTML: solutionHTML,
                comprehensionHTML: comprehensionHTML,
                // Keep text versions for display and export
                questionText: this.htmlToText(questionHTML),
                optionsText: optionsHTML.map(opt => ({ label: opt.label, text: this.htmlToText(opt.html) })),
                solutionText: this.htmlToText(solutionHTML),
                comprehensionText: comprehensionHTML ? this.htmlToText(comprehensionHTML) : null
            };

            // Display extracted data (text version for console)
            if (comprehensionHTML) {
                console.log(`📖 Comprehension: ${extractionResults[lang].comprehensionText}`);
            }
            
            console.log(`Question: ${extractionResults[lang].questionText}`);
            
            if (optionsHTML.length > 0) {
                optionsHTML.forEach(option => {
                    console.log(`   ${option.label}) ${this.htmlToText(option.html)}`);
                });
            } else {
                console.log('   ⚠️ No options found');
            }

            console.log(`Solution: ${extractionResults[lang].solutionText}`);

            // Track statistics
            if (questionHTML !== '<p>Question text not available</p>' && questionHTML !== '<p>Question not found</p>') {
                hasAnyData = true;
            } else {
                if (lang === 'en') this.stats.missingEnglish++;
                if (lang === 'hn') this.stats.missingHindi++;
            }

            if (optionsHTML.length === 0) {
                this.stats.missingOptions++;
            }
        });

        // Get correct answer
        const correctAnswer = this.getCorrectAnswer(sectionIndex, questionIndex);
        console.log(`\n✅ Correct Answer: ${correctAnswer}`);

        // Store the extracted data with HTML preserved (excluding questionHTML and optionsHTML)
        const extractedQuestion = {
            questionNo: questionNumber,
            sectionNo: sectionIndex + 1,
            questionNoInSection: questionIndex + 1,
            sectionTitle: sectionTitle || `Section ${sectionIndex + 1}`,
            questionId: question._id || `q${questionNumber}`,
            // Enhanced identification for merging with chapter data
            mergeKey: `${sectionIndex}_${questionIndex}`, // Section-Question index combination
            originalQuestionId: question._id, // Original MongoDB ID
            questionType: question.type || 'unknown',
            marks: question.posMarks || question.marks || null,
            negativeMarks: question.negMarks || null,
            isComprehension: this.hasComprehension(sectionIndex, questionIndex),
            // Language data
            english: extractionResults.en,
            hindi: extractionResults.hn,
            correctAnswer: correctAnswer,
            rawQuestion: question,
            extractionStatus: hasAnyData ? 'success' : 'failed'
        };

        this.allQuestions.push(extractedQuestion);

        // Update statistics
        if (hasAnyData) {
            this.stats.successfulExtractions++;
        } else {
            this.stats.failedExtractions++;
        }
        
        this.stats.totalQuestions++;
    }

    // Log question debugging information
    logQuestionDebugInfo(question, context) {
        console.log('🔍 Question Analysis:');
        console.log(`   Question ID: ${question._id || 'N/A'}`);
        console.log(`   Available properties: [${Object.keys(question).join(', ')}]`);
        
        // Check for correct answer indicators
        if (question.correctOption) {
            console.log(`   Correct Option Found: ${question.correctOption}`);
        }
        
        const langKeys = Object.keys(question).filter(key => key === 'en' || key === 'hn');
        console.log(`   Language keys: [${langKeys.join(', ')}]`);
        
        langKeys.forEach(lang => {
            if (question[lang] && typeof question[lang] === 'object') {
                console.log(`   ${lang.toUpperCase()} properties: [${Object.keys(question[lang]).join(', ')}]`);
                
                if (question[lang].options && Array.isArray(question[lang].options)) {
                    console.log(`   ${lang.toUpperCase()} options count: ${question[lang].options.length}`);
                    
                    // Check for correct flags in options
                    const correctOptions = question[lang].options.filter(opt => opt.correct === true || opt.isCorrect === true);
                    if (correctOptions.length > 0) {
                        console.log(`   ${lang.toUpperCase()} correct options detected: ${correctOptions.length}`);
                    }
                }

                // Check for solutions
                if (question[lang].sol || question[lang].solution) {
                    console.log(`   ${lang.toUpperCase()} solution available: Yes`);
                }

                // Check for comprehensions
                if (question[lang].comp || question[lang].comprehension) {
                    console.log(`   ${lang.toUpperCase()} comprehension available: Yes`);
                }
            }
        });
    }

    // Log section start
    logSectionStart(section, sectionIndex) {
        console.log(`\n📁 SECTION ${sectionIndex + 1}: ${section.title || 'Untitled'}`);
        console.log(`📊 Questions in this section: ${section.questions ? section.questions.length : 0}`);
        console.log('='.repeat(80));
    }

    // Enhanced logging methods
    logError(message, details = null) {
        console.error(`❌ ${message}`);
        if (details) {
            console.error('   Details:', details);
        }
        this.errors.push({ message, details, timestamp: new Date() });
    }

    logWarning(message, details = null) {
        console.warn(`⚠️ ${message}`);
        if (details) {
            console.warn('   Details:', details);
        }
        this.warnings.push({ message, details, timestamp: new Date() });
    }

    // Log final extraction results with improved statistics
    logFinalResults() {
        console.log('\n' + '='.repeat(60));
        console.log('🎯 HTML EXTRACTION COMPLETE!');
        console.log('='.repeat(60));
        
        console.log('\n📊 Statistics:');
        console.log(`   Total Questions Processed: ${this.stats.totalQuestions}`);
        console.log(`   Successful Extractions: ${this.stats.successfulExtractions}`);
        console.log(`   Failed Extractions: ${this.stats.failedExtractions}`);
        console.log(`   Missing English: ${this.stats.missingEnglish}`);
        console.log(`   Missing Hindi: ${this.stats.missingHindi}`);
        console.log(`   Missing Options: ${this.stats.missingOptions}`);
        console.log(`   Missing Correct Answers: ${this.stats.missingCorrectAnswers}`);
        console.log(`   Found Correct Answers: ${this.stats.foundCorrectAnswers}`);
        console.log(`   Missing Solutions: ${this.stats.missingSolutions}`);
        console.log(`   Found Solutions: ${this.stats.foundSolutions}`);
        console.log(`   Comprehension Questions: ${this.stats.comprehensionQuestions}`);
        console.log(`   Found Comprehensions: ${this.stats.foundComprehensions}`);
        console.log(`   Missing Comprehensions: ${this.stats.missingComprehensions}`);
        
        const successRate = this.stats.totalQuestions > 0 ? 
            Math.round((this.stats.successfulExtractions / this.stats.totalQuestions) * 100) : 0;
        const correctAnswerRate = this.stats.totalQuestions > 0 ? 
            Math.round((this.stats.foundCorrectAnswers / this.stats.totalQuestions) * 100) : 0;
        const solutionRate = this.stats.totalQuestions > 0 ? 
            Math.round((this.stats.foundSolutions / this.stats.totalQuestions) * 100) : 0;
        const comprehensionRate = this.stats.comprehensionQuestions > 0 ? 
            Math.round((this.stats.foundComprehensions / this.stats.comprehensionQuestions) * 100) : 0;
            
        console.log(`   Success Rate: ${successRate}%`);
        console.log(`   Correct Answer Detection Rate: ${correctAnswerRate}%`);
        console.log(`   Solution Detection Rate: ${solutionRate}%`);
        console.log(`   Comprehension Detection Rate: ${comprehensionRate}%`);

        if (this.errors.length > 0) {
            console.log(`\n❌ Errors encountered: ${this.errors.length}`);
            console.log('   Use htmlExtractor.errors to view details');
        }

        if (this.warnings.length > 0) {
            console.log(`\n⚠️ Warnings generated: ${this.warnings.length}`);
            console.log('   Use htmlExtractor.warnings to view details');
        }

        console.log('\n📥 Export Options:');
        console.log('   htmlExtractor.exportToCSV()   // Download CSV with solution & comprehension HTML');
        console.log('   htmlExtractor.exportToJSON()  // Download JSON with solution & comprehension HTML preserved');
        console.log('   htmlExtractor.exportToHTML()  // Download HTML preview file with comprehensions');
        console.log('   htmlExtractor.exportReport()  // Download diagnostic report');
        console.log('\n💡 Extracted data: htmlExtractor.allQuestions');
        console.log('📝 Note: questionHTML and optionsHTML excluded, solutionHTML and comprehensionHTML preserved');
    }

    // Enhanced CSV export with HTML content (excluding questionHTML and optionsHTML)
    exportToCSV() {
        if (this.allQuestions.length === 0) {
            console.log('❌ No questions to export. Run extractAllQuestions() first.');
            return;
        }

        try {
            console.log('\n💾 Generating HTML CSV export...');

            // Create exam details section
            const examDetails = this.getExamDetails();
            
            let csvContent = '\uFEFF';
            
            // Add exam information at the top
            csvContent += 'EXAM DETAILS\n';
            csvContent += `"Title","${examDetails.title}"\n`;
            csvContent += `"Course","${examDetails.course}"\n`;
            csvContent += `"Total Questions","${examDetails.totalQuestions}"\n`;
            csvContent += `"Total Sections","${examDetails.totalSections}"\n`;
            csvContent += `"Extraction Date","${examDetails.extractionDate}"\n\n`;
            
            // Add section details
            csvContent += 'SECTION DETAILS\n';
            csvContent += '"Section No","Section Title","Questions Count"\n';
            examDetails.sections.forEach(section => {
                csvContent += `"${section.sectionNo}","${section.title.replace(/"/g, '""')}","${section.questionsCount}"\n`;
            });
            csvContent += '\n';

            // Add question data headers
            const headers = [
                'Question No', 'Section', 'Question ID', 'Correct Answer', 'Extraction Status', 'Has Comprehension',
                'Comprehension HTML (English)', 'Question Text (English)', 'Option A Text (English)', 'Option B Text (English)', 
                'Option C Text (English)', 'Option D Text (English)', 'Solution HTML (English)',
                'Comprehension HTML (Hindi)', 'Question Text (Hindi)', 'Option A Text (Hindi)', 'Option B Text (Hindi)', 
                'Option C Text (Hindi)', 'Option D Text (Hindi)', 'Solution HTML (Hindi)'
            ];

            csvContent += 'QUESTIONS DATA\n';
            csvContent += headers.join(',') + '\n';

            this.allQuestions.forEach(q => {
                const hasComprehension = !!(q.english.comprehensionHTML || q.hindi.comprehensionHTML);
                const row = [
                    q.questionNo,
                    `"${(q.sectionTitle || '').replace(/"/g, '""')}"`,
                    `"${(q.questionId || '').replace(/"/g, '""')}"`,
                    q.correctAnswer || 'N/A',
                    q.extractionStatus || 'unknown',
                    hasComprehension ? 'Yes' : 'No',
                    `"${(q.english.comprehensionHTML || '').replace(/"/g, '""')}"`,
                    `"${(q.english.questionText || '').replace(/"/g, '""')}"`,
                    `"${(q.english.optionsText[0]?.text || '').replace(/"/g, '""')}"`,
                    `"${(q.english.optionsText[1]?.text || '').replace(/"/g, '""')}"`,
                    `"${(q.english.optionsText[2]?.text || '').replace(/"/g, '""')}"`,
                    `"${(q.english.optionsText[3]?.text || '').replace(/"/g, '""')}"`,
                    `"${(q.english.solutionHTML || '').replace(/"/g, '""')}"`,
                    `"${(q.hindi.comprehensionHTML || '').replace(/"/g, '""')}"`,
                    `"${(q.hindi.questionText || '').replace(/"/g, '""')}"`,
                    `"${(q.hindi.optionsText[0]?.text || '').replace(/"/g, '""')}"`,
                    `"${(q.hindi.optionsText[1]?.text || '').replace(/"/g, '""')}"`,
                    `"${(q.hindi.optionsText[2]?.text || '').replace(/"/g, '""')}"`,
                    `"${(q.hindi.optionsText[3]?.text || '').replace(/"/g, '""')}"`,
                    `"${(q.hindi.solutionHTML || '').replace(/"/g, '""')}"`
                ];
                csvContent += row.join(',') + '\n';
            });

            this.downloadFile(csvContent, 'csv', 'text/csv;charset=utf-8;', examDetails.title);
            console.log('✅ HTML CSV file downloaded successfully!');
            
        } catch (error) {
            this.logError('Failed to export CSV', error);
        }
    }

    // Enhanced JSON export with HTML
    exportToJSON() {
        if (this.allQuestions.length === 0) {
            console.log('❌ No questions to export. Run extractAllQuestions() first.');
            return;
        }

        try {
            console.log('\n💾 Generating HTML JSON export...');

            const examDetails = this.getExamDetails();

            const exportData = {
                examDetails: examDetails,
                metadata: {
                    extractedOn: new Date().toISOString(),
                    extractor: 'Ultimate HTML Testbook Extractor',
                    format: 'HTML Preserved',
                    statistics: this.stats
                },
                testInfo: {
                    title: this.testData?.title,
                    id: this.testData?._id,
                    course: this.testData?.course,
                    totalQuestions: this.testData?.totalQuestions,
                    sections: this.testData?.sections?.map(s => ({
                        title: s.title,
                        questionCount: s.questions?.length || 0
                    }))
                },
                questions: this.allQuestions.map(q => ({
                    ...q,
                    rawQuestion: undefined
                }))
            };

            const jsonContent = JSON.stringify(exportData, null, 2);
            this.downloadFile(jsonContent, 'json', 'application/json', examDetails.title);
            console.log('✅ HTML JSON file downloaded successfully!');
            
        } catch (error) {
            this.logError('Failed to export JSON', error);
        }
    }

    // Export as HTML preview file
    exportToHTML() {
        if (this.allQuestions.length === 0) {
            console.log('❌ No questions to export. Run extractAllQuestions() first.');
            return;
        }

        try {
            console.log('\n💾 Generating HTML preview file...');

            const examDetails = this.getExamDetails();

            let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${examDetails.title} - Question Bank</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .exam-header { background: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 2px solid #4a90e2; }
        .exam-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 15px 0; }
        .detail-item { background: white; padding: 10px; border-radius: 5px; border: 1px solid #ddd; }
        .sections-overview { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .question-container { margin-bottom: 30px; border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
        .question-header { background: #f5f5f5; padding: 10px; margin: -20px -20px 20px -20px; border-radius: 8px 8px 0 0; }
        .language-section { margin: 20px 0; padding: 15px; background: #fafafa; border-radius: 5px; }
        .options { margin: 10px 0; }
        .option { margin: 5px 0; padding: 8px; background: #f9f9f9; border-radius: 3px; }
        .solution { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .comprehension { background: #fff8dc; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #daa520; }
        .correct-answer { color: green; font-weight: bold; }
        .language-title { font-weight: bold; color: #333; font-size: 1.1em; margin-bottom: 10px; }
        .stats-summary { background: #e6f3ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="exam-header">
        <h1>📚 ${examDetails.title}</h1>
        
        <div class="exam-details">
            <div class="detail-item">
                <strong>📖 Course:</strong><br>${examDetails.course}
            </div>
            <div class="detail-item">
                <strong>📝 Total Questions:</strong><br>${examDetails.totalQuestions}
            </div>
            <div class="detail-item">
                <strong>📂 Total Sections:</strong><br>${examDetails.totalSections}
            </div>
            <div class="detail-item">
                <strong>📅 Extracted On:</strong><br>${examDetails.extractionDate}
            </div>
        </div>

        <div class="sections-overview">
            <h3>📋 Section Overview</h3>
            ${examDetails.sections.map(section => 
                `<div><strong>Section ${section.sectionNo}:</strong> ${section.title} (${section.questionsCount} questions)</div>`
            ).join('')}
        </div>

        <div class="stats-summary">
            <h3>📊 Extraction Statistics</h3>
            <div class="exam-details">
                <div class="detail-item">
                    <strong>✅ Success Rate:</strong><br>${Math.round((this.stats.successfulExtractions / this.stats.totalQuestions) * 100)}%
                </div>
                <div class="detail-item">
                    <strong>🎯 Correct Answers Found:</strong><br>${this.stats.foundCorrectAnswers}/${this.stats.totalQuestions}
                </div>
                <div class="detail-item">
                    <strong>💡 Solutions Found:</strong><br>${this.stats.foundSolutions}/${this.stats.totalQuestions}
                </div>
                <div class="detail-item">
                    <strong>📖 Comprehensions Found:</strong><br>${this.stats.foundComprehensions}/${this.stats.comprehensionQuestions}
                </div>
                <div class="detail-item">
                    <strong>⚠️ Issues:</strong><br>${this.errors.length + this.warnings.length} total
                </div>
            </div>
        </div>
    </div>
`;

            this.allQuestions.forEach(q => {
                const hasComprehension = !!(q.english.comprehensionHTML || q.hindi.comprehensionHTML);
                htmlContent += `
    <div class="question-container">
        <div class="question-header">
            <h3>Question ${q.questionNo} (${q.sectionTitle})</h3>
            <p><strong>Correct Answer:</strong> <span class="correct-answer">${q.correctAnswer}</span></p>
            ${hasComprehension ? '<p><strong>📖 Has Comprehension:</strong> Yes</p>' : ''}
        </div>
        
        <div class="language-section">
            <div class="language-title">🌐 English</div>
            ${q.english.comprehensionHTML ? `
            <div class="comprehension">
                <strong>📖 Comprehension Passage:</strong><br>
                ${q.english.comprehensionHTML}
            </div>` : ''}
            <div class="question">${q.english.questionText}</div>
            <div class="options">
                ${q.english.optionsText.map(opt => `<div class="option"><strong>${opt.label})</strong> ${opt.text}</div>`).join('')}
            </div>
            <div class="solution">
                <strong>Solution:</strong><br>
                ${q.english.solutionHTML}
            </div>
        </div>
        
        <div class="language-section">
            <div class="language-title">🌐 Hindi</div>
            ${q.hindi.comprehensionHTML ? `
            <div class="comprehension">
                <strong>📖 Comprehension Passage:</strong><br>
                ${q.hindi.comprehensionHTML}
            </div>` : ''}
            <div class="question">${q.hindi.questionText}</div>
            <div class="options">
                ${q.hindi.optionsText.map(opt => `<div class="option"><strong>${opt.label})</strong> ${opt.text}</div>`).join('')}
            </div>
            <div class="solution">
                <strong>Solution:</strong><br>
                ${q.hindi.solutionHTML}
            </div>
        </div>
    </div>
`;
            });

            htmlContent += `
</body>
</html>`;

            this.downloadFile(htmlContent, 'html', 'text/html;charset=utf-8;', examDetails.title);
            console.log('✅ HTML preview file downloaded successfully!');
            
        } catch (error) {
            this.logError('Failed to export HTML preview', error);
        }
    }

    // Export diagnostic report
    exportReport() {
        try {
            console.log('\n📋 Generating HTML diagnostic report...');

            const examDetails = this.getExamDetails();

            const report = {
                examDetails: examDetails,
                metadata: {
                    extractedOn: new Date().toISOString(),
                    extractor: 'Ultimate HTML Testbook Extractor v1.0',
                    format: 'HTML Preserved',
                    testInfo: {
                        title: this.testData?.title,
                        id: this.testData?._id,
                        course: this.testData?.course,
                        totalQuestions: this.testData?.totalQuestions
                    }
                },
                capabilities: {
                    angularScope: !!this.scope,
                    answersData: !!this.answers,
                    correctAnswers: this.stats.foundCorrectAnswers,
                    solutions: this.stats.foundSolutions,
                    htmlPreservation: true,
                    scopeMethods: this.scope ? {
                        getQuestionDesc: !!this.scope.getQuestionDesc,
                        getOptions: !!this.scope.getOptions,
                        getSolutionDesc: !!this.scope.getSolutionDesc,
                        isCorrectOption: !!this.scope.isCorrectOption
                    } : null
                },
                statistics: this.stats,
                sections: this.testData?.sections?.map((s, i) => ({
                    index: i + 1,
                    title: s.title,
                    questionCount: s.questions?.length || 0
                })),
                errors: this.errors,
                warnings: this.warnings,
                sampleQuestions: this.allQuestions.slice(0, 3) // Include first 3 questions as samples
            };

            const reportContent = JSON.stringify(report, null, 2);
            this.downloadFile(reportContent, 'json', 'application/json', examDetails.title + '_report');
            console.log('✅ HTML diagnostic report downloaded successfully!');
            
        } catch (error) {
            this.logError('Failed to export diagnostic report', error);
        }
    }

    // Get comprehensive exam details
    getExamDetails() {
        const currentDate = new Date();
        const sections = this.testData?.sections?.map((section, index) => ({
            sectionNo: index + 1,
            title: section.title || `Section ${index + 1}`,
            questionsCount: section.questions?.length || 0
        })) || [];

        return {
            title: this.sanitizeFileName(this.testData?.title || 'Testbook_Exam'),
            course: this.testData?.course || 'N/A',
            examId: this.testData?._id || 'N/A',
            totalQuestions: this.testData?.totalQuestions || this.allQuestions.length,
            totalSections: sections.length,
            extractionDate: currentDate.toLocaleDateString(),
            extractionTime: currentDate.toLocaleTimeString(),
            sections: sections,
            extractionStats: {
                successfulExtractions: this.stats.successfulExtractions,
                failedExtractions: this.stats.failedExtractions,
                correctAnswersFound: this.stats.foundCorrectAnswers,
                solutionsFound: this.stats.foundSolutions
            }
        };
    }

    // Sanitize filename to remove invalid characters
    sanitizeFileName(filename) {
        if (!filename) return 'Testbook_Exam';
        
        // Remove or replace invalid filename characters
        return filename
            .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid chars with underscore
            .replace(/\s+/g, '_') // Replace spaces with underscore
            .replace(/_{2,}/g, '_') // Replace multiple underscores with single
            .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
            .substring(0, 100); // Limit length to 100 characters
    }

    // Enhanced utility function to download files with custom filename
    downloadFile(content, extension, mimeType, customName = null) {
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        
        if (customName) {
            const sanitizedName = this.sanitizeFileName(customName);
            link.download = `${sanitizedName}.${extension}`;
        } else {
            link.download = `testbook_html_${new Date().toISOString().split('T')[0]}.${extension}`;
        }
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    // Main execution
    run() {
        console.log('🚀 Ultimate HTML Testbook Question Extractor v1.0');
        console.log('📝 Preserves solution and comprehension HTML formatting');
        console.log('='.repeat(65));

        if (this.init()) {
            this.extractAllQuestions();
        } else {
            console.error('❌ Failed to initialize. Cannot proceed with extraction.');
        }
    }
}

// Initialize and run
const htmlExtractor = new UltimateHTMLTestbookExtractor();
window.htmlExtractor = htmlExtractor;
htmlExtractor.run(); 