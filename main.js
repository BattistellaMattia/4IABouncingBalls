document.addEventListener("DOMContentLoaded", () => {
  const ballsCounter = document.getElementById('balls-counter'); //constant for the counter of balls
  const timer = document.getElementById('timer'); //constant for the timer
  let startTime = null; //variable of the start of the seconds count
  let count = 0;

  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');

  const startScreen = document.getElementById('start-screen');
  const startButton = document.getElementById('start-button');
  const infoButton = document.getElementById('info-button');
  const infoDiv = document.querySelector('.info');

  const playerNameInput = document.getElementById('player-name');
  const saveNameButton = document.getElementById('save-name-button');
  const playerNameDisplay = document.createElement('div');
  playerNameDisplay.id = 'player-name-display';
  document.body.appendChild(playerNameDisplay);

  const clearNameButton = document.getElementById('clear-name-button');

  let gameStarted = false;
  let balls = [];
  let level = 1;

  let evilBall;
  let goodBall;
  let followerBall;

  let currentLevel = 1;

  let result = false;

  let followerVisible = false; //to track visibility of the Follower Circle
  let followerVisibilityTimer = 0; //timer to manage random intervals for visibility
  let followerDisappearTimer = 0; //timer to manage random intervals for disappearance

  /////////////////////////////////////////////////////////////////////////////////

  const savedPlayerName = localStorage.getItem('playerName');
  if (savedPlayerName) 
    {
      playerNameInput.value = savedPlayerName; 
      playerNameDisplay.textContent = savedPlayerName; 
      playerNameInput.disabled = true; 
      saveNameButton.disabled = true;
    }

  saveNameButton.addEventListener('click', () => 
    {
      const playerName = playerNameInput.value.trim();
      if (playerName) 
      {
        localStorage.setItem('playerName', playerName); 
        playerNameDisplay.textContent = playerName;
        playerNameInput.disabled = true;
        saveNameButton.disabled = true;
      }
    });

  /////////////////////////////////////////////////////////////////////////////////

  clearNameButton.addEventListener('click', () => 
    {
      playerNameInput.value = ''; //clear the input field
      playerNameDisplay.textContent = ''; //clear the displayed player name
      playerNameInput.disabled = false; //re-enable the input field
      saveNameButton.disabled = false; //re-enable the SAVE button
    });

  /////////////////////////////////////////////////////////////////////////////////

  function toggleFollowerVisibility() 
  {
    //randomize visibility duration
    const visibilityDuration = random(1000, 3000);
    const disappearDuration = random(1000, 3000);

    //set follower to be visible for a random time
    followerVisible = true;
    followerVisibilityTimer = setTimeout(() => 
      {
        followerVisible = false;
        //after the visibility duration ends, set follower to disappear
        followerDisappearTimer = setTimeout(toggleFollowerVisibility, disappearDuration);
      }, visibilityDuration);
  }

  /////////////////////////////////////////////////////////////////////////////////

  function endGame(result) 
  {
    const ballsInPlay = document.getElementById('balls-counter').textContent;
    const elapsedTime = parseInt(document.getElementById('timer').textContent);
    const bestTime = parseInt(localStorage.getItem('bestTime')) || null;
    
    localStorage.setItem('lastTime', elapsedTime);
  
    localStorage.setItem('gameResult', result.toString());
    localStorage.setItem('ballsInPlay', ballsInPlay);
  
    window.location.href = 'end.html';
  }
  
  /////////////////////////////////////////////////////////////////////////////////

  startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    infoDiv.style.display = 'block';
    canvas.style.display = 'block';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameStarted = true;
    evilBall = new EvilCircle(random(0, canvas.width), random(0, canvas.height));
    startLevel(1);
  });

  /////////////////////////////////////////////////////////////////////////////////

  infoButton.addEventListener('click', () => 
  {
    window.open('help.html', '_blank');
  });

  /////////////////////////////////////////////////////////////////////////////////

  function startLevel(level) 
  {
    let numberOfBalls;
    let ballSpeed;

    let goodCircleSpeed;
    let followerCircleSpeed;

    let levelTime;

    if (level === 1) 
      {
        numberOfBalls = 20;
        ballSpeed = 2;
        goodCircleSpeed = 3;
        followerCircleSpeed = 3;
        levelTime = 60;
      } 
    else if (level === 2) 
      {
        numberOfBalls = 25;
        ballSpeed = 3;
        goodCircleSpeed = 1;
        followerCircleSpeed = 1;
        levelTime = 50;
      } 
    else if (level === 3) 
      {
        numberOfBalls = 30;
        ballSpeed = 4;
        goodCircleSpeed = 5;
        followerCircleSpeed = 5;
        levelTime = 40;
      }

    balls = [];

    for (let i = 0; i < numberOfBalls; i++) 
      {
        let size = random(10, 20);
        let ball = new Ball
        (
            random(0 + size, canvas.width - size),
            random(0 + size, canvas.height - size),
            random(-5, ballSpeed),
            random(-5, ballSpeed),
            randomRGB(),
            size
        );

        balls.push(ball);
      }
    
    //hiding the button until the level is completed
    document.getElementById('next-level').style.display = 'none';

    count = balls.length;
    ballsCounter.textContent = count;

    
    goodBall = new GoodCircle(random(0, canvas.width), random(0, canvas.height), goodCircleSpeed);
    followerBall = new FollowerCircle(random(0, canvas.width), random(0, canvas.height), followerCircleSpeed);
    
    startTimer();
    countdown(levelTime);
    loop(); 
 }
  /////////////////////////////////////////////////////////////////////////////////

  let remainingTime; 
  let remainingTimeDisplay = document.getElementById('remainingTime'); 

  function countdown(levelTime) 
  {
    remainingTime = levelTime; //set the initial remaining time to the levelTime

    function updateRemainingTime() 
    {
      //calculate the remaining time by subtracting the elapsed time from levelTime
      const elapsedTime = (Date.now() - startTime) / 1000;
      const calculatedRemainingTime = levelTime - elapsedTime;
    
      //display the remaining time
      remainingTimeDisplay.textContent = calculatedRemainingTime.toFixed(0);

      //check if the remaining time has reached 0
      if (calculatedRemainingTime <= 0) 
        {
          result = false;
          endGame(result);
        } 
        else 
        {
          requestAnimationFrame(updateRemainingTime); //continue updating the remaining time every frame
        }
    }

    updateRemainingTime(); //start the countdown by calling the update function
  }


  /////////////////////////////////////////////////////////////////////////////////


  document.getElementById('next-level').addEventListener('click', function() 
  {
    if (currentLevel < 3) 
      {
        currentLevel++; //move to the next level
        startLevel(currentLevel); //the new level begins
      } 
      else 
      {
        result = true;
        endGame(result);
      }
  });
  /////////////////////////////////////////////////////////////////////////////////

  //saving the last time
  const lastTime = document.getElementById('lastTime');
  const savedLastTime = localStorage.getItem('lastTime');
  if (savedLastTime) 
  {
    lastTime.textContent = parseFloat(savedLastTime).toFixed(2);
  } 
  else 
  {
    lastTime.textContent = "0.00"; //if there isn't a saved last time --> 0
  }

  //saving the best time
  const bestTime = document.getElementById('bestTime');
  const savedBestTime = localStorage.getItem('bestTime');
  if (savedBestTime) 
  {
    bestTime.textContent = parseFloat(savedBestTime).toFixed(2);
  } 
  else 
  {
    bestTime.textContent = "0.00"; //if there isn't a saved best time --> 0
  }

  /////////////////////////////////////////////////////////////////////////////////

  //function that starts counting seconds
  function startTimer() 
  {
    startTime = Date.now();
  }

  //function that updates the time passed since the start of the timer
  function updateTimer() 
  {
    const elapsedTime = (Date.now() - startTime) / 1000;
    timer.textContent = elapsedTime.toFixed(2);
  }

  //function that stops the timer
  function stopTimer() 
  {
    const calculatedLast = parseFloat(timer.textContent);
    lastTime.textContent = calculatedLast.toFixed(2);
    localStorage.setItem('lastTime', calculatedLast.toFixed(2)); //save of the lastTime in the localStorage

    const currentBestTime = parseFloat(bestTime.textContent);

    if (!currentBestTime || calculatedLast < currentBestTime) 
    {
      bestTime.textContent = calculatedLast.toFixed(2);
      localStorage.setItem('bestTime', calculatedLast.toFixed(2)); //save of the bestTime in the localStorage
    }
  }

  /////////////////////////////////////////////////////////////////////////////////

  function random(min, max) {
    const num = Math.floor(Math.random() * (max - min)) + min;
    return num;
  }

  function randomRGB() {
    return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
  }

  class Shape {
    constructor(x, y, velX, velY) {
      this.x = x;
      this.y = y;
      this.velX = velX;
      this.velY = velY;
    }
  }

  class Ball extends Shape {
    constructor(x, y, velX, velY, color, size) {
      super(x, y, velX, velY);

      this.color = color;
      this.size = size;
      this.exists = true;
    }

    draw() {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
      ctx.fill();
    }

    update() {
      if ((this.x + this.size) >= canvas.width) {
        this.velX = -(this.velX);
      }

      if ((this.x - this.size) <= 0) {
        this.velX = -(this.velX);
      }

      if ((this.y + this.size) >= canvas.height) {
        this.velY = -(this.velY);
      }

      if ((this.y - this.size) <= 0) {
        this.velY = -(this.velY);
      }

      this.x += this.velX;
      this.y += this.velY;
    }

    collisionDetect() {
      for (const ball of balls) {
        if (!(this === ball) && ball.exists) {
          const dx = this.x - ball.x;
          const dy = this.y - ball.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < this.size + ball.size) {
            ball.exists = false;
            count--;
            ballsCounter.textContent = count;
          }
        }
      }
    }
  }

  class EvilCircle extends Shape {
    constructor(x, y) {
      super(x, y, 20, 20);

      this.color = "red";
      this.size = 10;

      //for moving the EvilCircle using the mouse
      window.addEventListener('mousemove', (e) => {
        this.x = e.x;
        this.y = e.y;
      });

      //movement of the evilCircle with wasd and the arrows
      window.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'a':
            this.x -= this.velX;
            break;
          case 'd':
            this.x += this.velX;
            break;
          case 'w':
            this.y -= this.velY;
            break;
          case 's':
            this.y += this.velY;
            break;
          case 'ArrowLeft':
            this.x -= this.velX;
            break;
          case 'ArrowRight':
            this.x += this.velX;
            break;
          case 'ArrowUp':
            this.y -= this.velY;
            break;
          case 'ArrowDown':
            this.y += this.velY;
            break;
        }
      });
    }

    draw() {
      ctx.beginPath();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
      ctx.stroke();
    }

    checkBounds() {
      if ((this.x + this.size) >= canvas.width) {
        this.x -= this.size;
      }

      if ((this.x - this.size) <= 0) {
        this.x += this.size;
      }

      if ((this.y + this.size) >= canvas.height) {
        this.y -= this.size;
      }

      if ((this.y - this.size) <= 0) {
        this.y += this.size;
      }
    }

    collisionDetect() {
      for (const ball of balls) {
        if (ball.exists) {
          const dx = this.x - ball.x;
          const dy = this.y - ball.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < this.size + ball.size) {
            ball.exists = false;
            count--;
            ballsCounter.textContent = count;
          }
        }
      }
    }
  }

  class GoodCircle extends Shape {
    constructor(x, y, speed) {

      super(x, y, speed, speed)

      this.color = "white";
      this.size = 35; //larger than the other balls
      this.exists = true;
    }

    draw() {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
      ctx.fill();
    }

    checkBounds() {
      if ((this.x + this.size) >= canvas.width) {
        this.velX = -(this.velX);
      }

      if ((this.x - this.size) <= 0) {
        this.velX = -(this.velX);
      }

      if ((this.y + this.size) >= canvas.height) {
        this.velY = -(this.velY);
      }

      if ((this.y - this.size) <= 0) {
        this.velY = -(this.velY);
      }

      this.x += this.velX;
      this.y += this.velY;
    }

    collisionDetect() {
      const dx = this.x - evilBall.x;
      const dy = this.y - evilBall.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.size + evilBall.size) //if it hits the evilCircle
      {
        result = false;
        endGame(result);
      }
    }
  }

  class FollowerCircle extends Shape {
    constructor(x, y, speed) {
      super(x, y, speed, speed);

      this.color = "white"; 
      this.size = 35;
      this.exists = true;
    }

    draw() {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
      ctx.fill();
    }

    update() {
      const dx = evilBall.x - this.x;
      const dy = evilBall.y - this.y;
      const angle = Math.atan2(dy, dx);
      this.x += Math.cos(angle) * this.velX;
      this.y += Math.sin(angle) * this.velY;
    }

    collisionDetect() {
      const dx = this.x - evilBall.x;
      const dy = this.y - evilBall.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.size + evilBall.size) 
      {
        result = false;
        endGame(result);
      }
    }
  }

  /////////////////////////////////////////////////////////////////////////////////  

  function loop() {
    
    if (!gameStarted) //the game needs to be started
    {
      return;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const ball of balls) 
    {
      if (ball.exists) 
      {
        ball.draw();
        ball.update();
        ball.collisionDetect();
      }
    }

    evilBall.draw();
    evilBall.checkBounds();
    evilBall.collisionDetect();

    if (goodBall.exists) //after the balls are all eliminated, the good ball will disappear
    {
      goodBall.draw();
      goodBall.checkBounds();
      goodBall.collisionDetect();
    }

    if (followerBall.exists && followerVisible) 
    {
      followerBall.draw();
      followerBall.update();
      followerBall.collisionDetect();
    }
    

    if (count > 0) 
    {
      updateTimer(); //update of the timer every frame
    } 
    else //if the balls are all eliminated
    {
      goodBall.exists = false;
      followerBall.exists = false;
      stopTimer(); //stop of the timer

      const nextLevelButton = document.getElementById('next-level');
      if (currentLevel < 3) 
      {
        nextLevelButton.innerText = 'Next Level';
      } 
      else 
      {
        nextLevelButton.innerText = 'FINISH';
      }
      nextLevelButton.style.display = 'block';
    }

    requestAnimationFrame(loop);
  }

  toggleFollowerVisibility();

  /////////////////////////////////////////////////////////////////////////////////  

});