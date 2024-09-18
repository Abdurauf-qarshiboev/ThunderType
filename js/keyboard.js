const words = "our night big begin will move mean may another between something were page right every line oil see into do she form hand change important along once mean he use what new even this me high got tree on house face grow give find mile leave learn talk people them school call few change came those fall same you two here often no grow water page left run were being city change like up life second really be really children book help often their your best begin off home walk".split(' ');

const wordsCount = words.length;
const InfoDisplay = document.getElementById('info');
const accuracyDisplay = document.getElementById('accuracy')
const wordsDiv = document.getElementById('words');
const gameDiv = document.getElementById('game');
const gameTime = 30 * 1000;
window.timer = null;
window.gameStart = null;

    const AddClass = (el,className) => {
        if (el && !el.classList.contains(className)) {
            el.classList.add(className);
        }
    };

    const RemoveClass = (el, name) => {
        el.className = el.className.replace(name,'');
    };

    const RandomWord = () => {
        const randomIndex = Math.ceil(Math.random() * wordsCount);
        return words[randomIndex-1];
    };

    const newgameBtn = document.getElementById("newgame");
    newgameBtn.addEventListener("click", () => {
        location.reload();
        NewGame();
    });


    const FormatWord = (word) => {
        return `<div class="word inline-block mx-[5px]"><span class="letter">${word?.split("").join('</span><span class="letter">')}</span></div>`;
        
    }

    const NewGame = () => {
        wordsDiv.innerHTML = " ";
        for (i = 0; i <= 200; i++){
            wordsDiv.innerHTML += FormatWord(RandomWord());
        }
        AddClass(document.querySelector('.word'),'current');
        AddClass(document.querySelector('.letter'),'current');
        InfoDisplay.innerHTML = gameTime/1000 + '';
        window.timer = null;
    }

    let totalWordsTyped = 0; 
    let correctWordsTyped = 0;

    const CalculateWPM = () =>{
        const words = [...document.querySelectorAll('.word')];
        
        const lastTypedWord = document.querySelector('.word.current');
        const lastTypedWordIndex = words.indexOf(lastTypedWord);
        const typedWords = words.slice(0,lastTypedWordIndex);

        const correctlyTypedWords = typedWords.filter(typedWord => {
            const letters = [...typedWord.children];
            // console.log(letters);
            
            const incorrectLetters = letters.filter(letter => 
                letter.className.includes('text-incorrect')
            );
            // console.log(incorrectLetters);
            
            const correctLetters = letters.filter(letter => 
                letter.className.includes('text-correct')
            );
            // console.log(correctLetters);
            return incorrectLetters.length === 0 && correctLetters.length === letters.length;
        });

        // accuracy calculator
        totalWordsTyped += typedWords.length; 
        correctWordsTyped += correctlyTypedWords.length;
        // console.log({correctlyTypedWords});
        const accuracy = totalWordsTyped > 0 ? (correctWordsTyped / totalWordsTyped) * 100 : 0;
        displayAccuracy(accuracy);

        return (correctlyTypedWords.length / gameTime) * 60000;
    }
    const displayAccuracy = (accuracy) => {
        accuracyDisplay.innerHTML = `Accuracy: ${accuracy.toFixed(2)}%`;
    };

    const gameOver = () => {
        clearInterval(window.timer);
        AddClass(gameDiv,'gameIsOver');
        const result = CalculateWPM();
        // console.log({result});
        InfoDisplay.innerHTML = `WPM: ${result}`;
    }

    document.addEventListener("keyup", (e) => {
        // console.log(e.key);
        if (e.key === "Shift") {
            e.preventDefault(); 
            gameDiv.focus(); 
        };
    });

    gameDiv.addEventListener('keyup', ev => {
        ev.preventDefault();
        const key = ev.key;
        const currentWord = document.querySelector('.word.current');
        const currentLetter = document.querySelector('.letter.current');
        const expected = currentLetter?.innerHTML || ' ';
        const isLetter = key.length === 1 && key !== ' ';
        const isSpace = key === ' ';
        const isBackpace = key === "Backspace";
        const isFirstLetter = currentLetter === currentWord.firstChild;

        if(gameDiv.classList.contains('gameIsOver')){
            return false;
        }

        // console.log({key,expected});

        if(!window.timer && isLetter){
            window.timer = setInterval(() => {
                if(!window.gameStart){
                    window.gameStart = (new Date()).getTime();
                }
                const currentTime = new Date().getTime();
                const timePassed = Math.round((currentTime - window.gameStart)/1000);
                const timeLeft = (gameTime/1000) - timePassed;
                if (timeLeft <= 0 ){
                    gameOver();
                    return false
                }
                InfoDisplay.innerHTML = timeLeft;
            }, 1000);
        }
        
        if(isLetter){
            if(currentLetter){
                AddClass(currentLetter, key === expected ? 'text-correct':'text-incorrect');
                RemoveClass(currentLetter, 'current');
                if(currentLetter.nextSibling){
                    AddClass(currentLetter.nextSibling, "current");
                }
            }else{
                const extraLetter = document.createElement('span');
                extraLetter.innerHTML = key;
                extraLetter.className = "letter text-extra text-incorrect";
                currentWord.appendChild(extraLetter);
            }  
        };

        if (isSpace) {
            if (expected !== ' ') {
                const invalidLetters = document.querySelectorAll('.word.current .letter:not(.text-correct)');
                invalidLetters.forEach(letter => {
                    AddClass(letter, 'text-incorrect');
                });
            }

            // accuracy

            RemoveClass(currentWord, 'current');
            AddClass(currentWord.nextSibling, 'current');

            if(currentLetter){
                RemoveClass(currentLetter, 'current');
            }
            AddClass(currentWord.nextSibling.firstChild, 'current');
        }

        if(isBackpace){
            if(currentLetter && isFirstLetter){
                RemoveClass(currentWord, 'current');
                AddClass(currentWord.previousSibling, 'current');
                RemoveClass(currentLetter, 'current');
                AddClass(currentWord.previousSibling.lastChild, 'current')
                RemoveClass(currentWord.previousSibling.lastChild, 'text-correct');
                RemoveClass(currentWord.previousSibling.lastChild, 'text-incorrect');
                
            }
            if(currentLetter && !isFirstLetter){
                RemoveClass(currentLetter, 'current');
                AddClass(currentLetter.previousSibling, 'current');
                RemoveClass(currentLetter.previousSibling, "text-correct");
                RemoveClass(currentLetter.previousSibling, "text-incorrect");
            }
            if(!currentLetter){
                AddClass(currentWord.lastChild, 'current');
                RemoveClass(currentWord.lastChild, "text-correct");
                RemoveClass(currentWord.lastChild, "text-incorrect");
            }
        }

        // scrolling lines

        if (currentWord.getBoundingClientRect().top > 240){
            const margin = parseInt(wordsDiv.style.marginTop) || 0;
            wordsDiv.style.marginTop = margin - 32 + "px";
        }

        // moving the cursor

        const nextLetter = document.querySelector('.letter.current');
        const nextWord = document.querySelector('.word.current');
        const cursor = document.getElementById('cursor');
            cursor.style.top = (nextWord || nextLetter).getBoundingClientRect().top + 2 + "px";
            cursor.style.left = (nextWord || nextLetter).getBoundingClientRect()[nextLetter ? 'left' : 'right'] + "px";
        if(nextLetter){
            cursor.style.left = nextLetter.getBoundingClientRect().left + 'px';
        }else{
            cursor.style.left = nextWord.getBoundingClientRect().right + 'px';
        };

    });

    NewGame();