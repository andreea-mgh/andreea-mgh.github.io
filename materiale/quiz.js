const deleteOnLoad = document.getElementById("#deleteonload");
if (deleteOnLoad) {
    deleteOnLoad.remove();
}
const loadingMessage = document.createElement('p');
loadingMessage.textContent = 'Se încarcă...';
document.querySelector('.quiz-container').appendChild(loadingMessage);


function showResults(correctAnswers, totalQuestions) {
    const resultsDiv = document.createElement('div');
    resultsDiv.classList.add('results-container');
    
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    let message = '';
    
    if (correctAnswers === totalQuestions) {
        message = `<strong style="color:#275b37">Felicitări! Ai răspuns corect la toate întrebările!</strong>`;
    } else {
        message = `<p>Poți încerca din nou testul dacă vrei punctaj mai mare.</p>
        <button id="retry-quiz">Resetează testul</button>
        <br>`;
    }

    resultsDiv.innerHTML = `
        <p>Punctaj: <strong>${correctAnswers}/${totalQuestions}</strong> (${percentage}%)</p>
        ${message}
    `;

    const retryButton = resultsDiv.querySelector('#retry-quiz');
    if (retryButton) {
        retryButton.addEventListener('click', () => {

            window.location.href = `/materiale/test.html?code=${quizId}`;
        });
    }
    
    document.querySelector('.quiz-container').appendChild(resultsDiv);
    
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}


const params = new URLSearchParams(window.location.search);
const quizId = params.get("code");

// salveaza cod
let c = quizId ? quizId.toUpperCase() : null;
let visitedIds = JSON.parse(localStorage.getItem('visitedQuizIds') || '[]');
if (c && !visitedIds.includes(c)) {
    visitedIds.push(c.toUpperCase());
    localStorage.setItem('visitedQuizIds', JSON.stringify(visitedIds));
}

if (quizId) {
    fetch(`/materiale/test.json`)
        .then(response => response.json())
        .then(data => {
            const quizContainer = document.querySelector('.quiz-container');
            const quiz = data.find(q => q.cod.toUpperCase() === quizId.toUpperCase());
            if (quiz) {
                // page title
                document.title = `${quiz.title}`;
                quizContainer.innerHTML = `<h1>${quiz.title}</h1><p>${quiz.description}</p>`;
                
                // Track quiz progress
                let correctAnswers = 0;
                let answeredQuestions = 0;
                const totalQuestions = quiz.questions.length;
                
                quiz.questions.forEach((question, index) => {
                    const questionContainer = document.createElement('div');
                    questionContainer.classList.add('question-container');
                    quizContainer.appendChild(questionContainer);

                    const questionHtml = `
                        <hr>
                        <div class="question">
                            ${index + 1}. ${question.question}
                            <ul>
                                ${question.options.map((option, i) => `<li><input type="radio" name="question${index}" value="${i}"> ${option}</li>`).join('')}
                            </ul>
                            <button class="submit-answer" data-index="${index}">Submit</button>
                            <p class="explanation" style="display:none;">${question.explanation}</p>
                        </div>
                    `;
                    questionContainer.innerHTML = questionHtml;

                    const submitButton = questionContainer.querySelector('.submit-answer');
                    submitButton.addEventListener('click', () => {
                        const selectedOption = document.querySelector(`input[name="question${index}"]:checked`);
                        if (selectedOption) {
                            const answerIndex = parseInt(selectedOption.value);
                            answeredQuestions++;
                            
                            if (answerIndex === question.answer) {
                                correctAnswers++;
                                submitButton.classList.add('correct');
                                submitButton.textContent = 'Corect!';
                            } else {
                                submitButton.classList.add('incorrect');
                                submitButton.textContent = 'Greșit!';
                                const correctAnswer = question.options[question.answer];
                                const correctText = document.createElement('p');
                                correctText.innerHTML = `Răspunsul corect este: ${correctAnswer}`;
                                correctText.classList.add('correct-answer');
                                submitButton.parentElement.appendChild(correctText);
                            }
                            const explanation = submitButton.nextElementSibling;
                            explanation.style.display = 'block';
                            submitButton.disabled = true;
                            
                            // verifica finalizarea quizului
                            if (answeredQuestions === totalQuestions) {
                                showResults(correctAnswers, totalQuestions);
                            }
                        } else {
                            alert('Selectează un răspuns.');
                        }
                    });
                });

                loadingMessage.remove();
            } else {
                quizContainer.innerHTML = '<p>Cod greșit :(</p>';
            }
        })
        .catch(error => console.error('Error loading quiz:', error));
}
else {
    const quizContainer = document.querySelector('.quiz-container');
    // quizContainer.style.flexDirection = 'row';
    // quizContainer.style.justifyContent = 'center';
    // quizContainer.style.alignItems = 'center';

    const codeinput = document.createElement('div');
    codeinput.classList.add('cod');

    codeinput.innerHTML = '<p>Scrie codul profesoarei aici:  </p>';
    const input = document.createElement('input');
    input.type = 'text';
    codeinput.appendChild(input);
    // codeinput.appendChild(document.createElement('br'));
    const button = document.createElement('button');
    button.textContent = 'Go';
    button.addEventListener('click', () => {
        const code = input.value.trim();
        if (code) {
            window.location.href = `/materiale/test.html?code=${code}`;
        }
    });
    codeinput.appendChild(button);
    quizContainer.appendChild(codeinput);

    // show visited quizzes
    const visitedIds = JSON.parse(localStorage.getItem('visitedQuizIds') || '[]');
    if (visitedIds.length > 0) {
        const visitedContainer = document.createElement('div');
        visitedContainer.classList.add('visited-container');
        visitedContainer.innerHTML = '<p>Recente:</p>';

        visitedIds.forEach(id => {
            const idcontainer = document.createElement('div');
            idcontainer.classList.add('visited-id');
            idcontainer.textContent = id;
            idcontainer.addEventListener('click', () => {
                window.location.href = `/materiale/test.html?code=${id}`;
            });
            visitedContainer.appendChild(idcontainer);
        });
        quizContainer.appendChild(visitedContainer);
    }
    loadingMessage.remove();
}