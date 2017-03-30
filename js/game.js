var screenwidth=1200;
var screenheight=600;
var randomStudent;
var game = new Phaser.Game(screenwidth, screenheight, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });
var ballTimerEvent = null;
var balls = [];
var ball = null;

function preload() {
    game.load.image('Menu','images/MainMenu.png');
    game.load.image('MenuButton','images/MenuPlay.png');
    game.load.image('background','images/Background.png');
    game.load.image('ball', 'images/paperBall.png');
    game.load.image('slingshot', 'images/CatapultSprite.png')
    game.load.image('student1', 'images/student1.png');
    game.load.image('student2', 'images/student2.png');
    game.load.image('student3', 'images/student1.png');
    game.load.image('student4', 'images/student4.png');
    game.load.image('student5', 'images/student5.png');

    game.load.image('arrow', 'images/blackarrow.png');
    game.load.image('tail', 'images/black.png');
    game.load.image('origin', 'images/blackdot.png');
    game.load.image('analog','images/grey.png');

    game.load.image('pauseButton','images/PauseButton2.png');
    game.load.image('resetButton','images/ResetButton.png')
    game.load.image('playButton', 'images/PlayButton.png');

    //COLLISION NOT WORKING YET
    game.load.physics('physicsData', 'assets/studentHead1.json');
    game.load.image('gradeF','images/gradeF.png');

}

var text;
var counter = 0;
var slingshotX = 450;
var slingshotY = 500
var slingshotHeight = 340
//=======
//const slingshotX = 300;
//const slingshotY = 300
//const slingshotHeight = 340
//>>>>>>> Stashed changes
var ballInSlingshot;
var ballHeld = false; //checks if the ball is held or not
var ballSpeed = 0; // speed of the ball
const ballinitx=slingshotX+100;
const ballinity=slingshotY+65;
var ballFlying = false;
var ballCollided = false;
var currentVel = 0;
var sz = 0.15;


var analog;
var tail;
var arrow;
var origin;
var background;
const tailWidth = 10;

var resetButton;
var pauseButton;
var playButton;
const buttonXPos = 1100;
const buttonYPos = 50;
const pauseButtonHeight = 60;

var arrayStudents;
var lives=3;

var gradeF;

var ballsInMotion = [];

var mostRecentBall = 0;

function create() {

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;


    bground = game.add.sprite(0,0,'background');
    bground.alpha = 0.75; //transparency of background

    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 500; //larger y gravity the narrower the parabol.
    game.physics.p2.restitution = 0.1; //bounciness of the world
    game.physics.p2.setImpactEvents(true);

    text = game.add.text(450, 16, '', { fill: '#ffffff' });
    livesDisplay = game.add.text(1000,16,'',{fill: '#ffffff' });
    livesDisplay.text = "Lives : "+lives;

    var studentCollisionGroup = game.physics.p2.createCollisionGroup();
    var ballCollisionGroup = game.physics.p2.createCollisionGroup();
    var studentXs = [320,1000,870,200,600];
    var studentYs = [250,500,250,500,250];
    arrayStudents = [];

    for (var i=0; i<3; i++){
        var student = addStudent('student1', studentXs[i], studentYs[i]);
        arrayStudents.push(student);
        //student.body.setRectangle(80,80); //for collision, box-shaped

        // student.body.clearShapes();
    // student.body.loadPolygon('physicsData', 'student1');
    student.body.setCollisionGroup(studentCollisionGroup);
        student.body.collides([studentCollisionGroup, ballCollisionGroup]);
    }
    //  This creates a simple sprite that is using our loaded image and
    //  displays it on-screen and assign it to a variable
    slingshot = game.add.sprite(slingshotX,slingshotY,'slingshot');
    slingshot.height = slingshotHeight;

    //the control arrow
    analog = game.add.sprite(300, 300, 'analog');
    analog.width = tailWidth;
    analog.anchor.setTo(0.5,0);
    analog.rotation = 3.14/2;
    analog.alpha =0; //hide sprite

    tail = game.add.sprite(300, 300, 'tail');
    tail.width = tailWidth;
    tail.anchor.setTo(0.5,1)
    tail.rotation = 3.14/2;
    tail.alpha = 0;

    arrow = game.add.sprite(300, 300, 'arrow');
    arrow.scale.setTo(0.1,0.1);
    arrow.anchor.setTo(0,0.5);
    arrow.alpha = 0;

    origin = game.add.sprite(300,300,'origin');
    origin.scale.setTo(0.02,0.02);
    origin.anchor.setTo(0.5,0.5);
    origin.alpha = 0;

    //Respond to any input on screen
    // game.input.onDown.add(holdBall);
    // game.input.onUp.add(launchBall);


    //buttons
    pauseButton = game.add.button(buttonXPos, buttonYPos, 'pauseButton', pause , this, 2, 1, 0);
    resetButton = game.add.button(buttonXPos, buttonYPos+60, 'resetButton', reset , this, 2, 1, 0 );
    playButton = game.add.button(buttonXPos, buttonYPos+120,'playButton', play , this, 2, 1, 0);

   	pauseButton.scale.setTo(0.015,0.015);
   	resetButton.scale.setTo(0.15,0.15);
   	playButton.scale.setTo(0.054,0.054);

    randomIndex = Math.floor((Math.random() * 3))
    //randomIndex = 0;
    randomStudent = arrayStudents[randomIndex];
    for( var i=0; i< arrayStudents.length; i++)
    {
      arrayStudents[i].alpha = 0.50;
    }
    randomStudent.alpha = 1;


    gradeF = game.add.sprite(250,-100,'gradeF');
    gradeF.alpha = 0;

    menu = game.add.sprite(-100,-100,'Menu');
    menu.alpha = 1;


    menuButton = game.add.sprite(500,50,'MenuButton');
    menuButton.alpha = 1;
    menuButton.scale.setTo(0.1,0.1);
    menuButton.inputEnabled  = true;
    menuButton.events.onInputDown.add(removeMenu,this);

}

function createBall() {
  newBall = game.add.sprite(ballinitx, ballinity, 'ball');
  game.physics.p2.enable(newBall);
  newBall.scale.setTo(0.15,0.15);
  newBall.anchor.setTo(0.5, 0.5);
  newBall.body.setCircle(30); //for collision
  newBall.body.static = true;
  newBall.body.setCollisionGroup(ballCollisionGroup);
  newBall.body.collides(studentCollisionGroup , ballHit, this);
  //ballsInMotion.append(newBall);
  return newBall;
}

function addStudent(image, x, y){
    student = game.add.sprite(x,y, image);
    game.physics.p2.enable(student);
    student.anchor.set(0.5,0.5);
    student.body.static = true;
    //FOR COLLISION
    // student.body.clearShapes();
    //     student.body.loadPolygon('physicsData', 'student1');
    return(student)
}


function holdBall() {
    if(!ballFlying){
        showArrow();
        ballInSlingshot.body.static = true;
    }

}

function launchBall() {
    if(!ballFlying){
        hideArrow();
        ballInSlingshot.body.static = false;
        Xvector = (arrow.x - origin.x) *5;
        Yvector = (arrow.y - origin.y) *10;
        ballInSlingshot.body.velocity.x = Xvector;
        ballInSlingshot.body.velocity.y = Yvector;
        currentVel = Yvector;
        ballFlying = true;

        //CREATE A TIMER EVENT TO REDUCE SIZE OF BALL
        ballTimerEvent = game.time.events.loop(100, updateSize, this);
        //END TIMER

        ballsInMotion.append(ballInSlingshot);
        ballInSlingshot = createBall();
    }
}

function updateSize() {
    sz = sz*0.96;
    for(var i=0; i<ballsInMotion.length; i++){
    ballsInMotion[i].scale.setTo(sz,sz);
  }
}

function showArrow() {
    //create arrow where the pointer is
    origin.alpha = 1;
    arrow.alpha = 1;
    tail.alpha = 1;
    analog.alpha = 0.5;
    var originX = game.input.activePointer.worldX;
    var originY = game.input.activePointer.worldY;
    origin.x = originX;
    origin.y = originY;
    arrow.x = originX;
    arrow.y = originY;
    tail.x = originX;
    tail.y = originY;
    analog.x = originX;
    analog.y = originY;
}

function hideArrow(){
    origin.alpha = 0;
    arrow.alpha = 0;
    tail.alpha = 0;
    analog.alpha = 0;
}

function ballHit(body1, body2) {
    ballCollided = true;
    //restart();
    if (body2.x == randomStudent.x && body2.y == randomStudent.y){
        studentHit();
        chooseStudent();
        //restart();
        console.log("Hit the right student");
    }
    else{
        lives--;
        livesDisplay.text = "Lives : "+lives;
        //restart();
        console.log('Hit the wrong student');
    }
    checkLife();
}


function update() {
    //Randomized selection of student
    //TODO: update in p2 sys

      // if(game.physics.arcade.collide(randomStudent,ball))
      // {
      //   studentHit();
      //   chooseStudent();
      //   restart();
      // }
      //   else{
      //     for(i=0; i<5; i++)
      //     {
      //       if(arrayStudents[i]!=randomStudent && game.physics.arcade.collide(arrayStudents[i],ball))
      //       {
      //       lives--;
      //       livesDisplay.text = "Lives : "+lives;
      //       restart();
      //     }
      //   }
      //   }
      //   checkLife();

    //Restart after collision.
    for(var i=0; i<ballsInMotion.lenght; i++){
    // if (ball.x < 0 || ball.x > screenwidth || ball.y > screenheight || ball.y < 0){
    //     restart();
    // }
    ballsInMotion[i].body.collideWorldBounds = true;
    if(i==ballsInMotion.length -1)
    {
      restart();
    }
  }

    // update the control arrow
    if (game.input.activePointer.isDown && !ballFlying && !ballCollided){
        var dist = game.physics.arcade.distanceToPointer(origin);
        var angle = game.physics.arcade.angleToPointer(origin);

        if (Math.abs(angle) <= 0.05){
            arrow.rotation = 0;
        } else{
            arrow.rotation =  angle + 3.14;
        }
        tail.rotation = angle - 3.14/2;
        analog.rotation = angle - 3.14/2;

        tail.height = 0.5*dist;
        analog.height = dist;
        arrow.x = origin.x -  0.5*dist*Math.cos(angle);
        arrow.y = origin.y - 0.5*dist*Math.sin(angle);
        }

    //check when direction changed FOR COLLISION
    if (ballFlying){
        dirChange = directionChanged(ball.body.velocity.y);
    }


}


function directionChanged( newVel){
    if (newVel * currentVel < 0){
        currentVel = newVel;
        console.log('ball falling')
        return true;
    } else{
        currentVel = newVel;
        return false;
    }
}


function reset(){
  gradeF.alpha = 0;
restart();
  randomStudent.alpha = 0.5;
  chooseStudent();
  lives = 3;
counter =0;
text.text = "";
    livesDisplay.text ="Lives : "+lives;

}

function pause(){
    game.physics.p2.pause();
    game.time.events.pause(ballTimerEvent);
}


function restart(){
    ballSpeed=0;
    ballFlying = false;
    ballCollided = false;
    ball.reset(ballinitx,ballinity);
    ball.body.static = true;
    game.time.events.remove(ballTimerEvent);
    ball.scale.setTo(0.15,0.15);
    sz = 0.15;
}

function play()
{
    if(ballFlying)
    {
        game.time.events.resume(timerEvent);
        game.physics.p2.resume();
    }else{
        pass;
    }
}

//<<<<<<< Updated upstream
//=======
function removeMenu()
{
  menu.alpha=0;
  menuButton.alpha = 0;
  menuButton.inputEnabled = false;
  bground.inputEnabled = true;
  bground.events.onInputDown.add(holdBall);
  bground.events.onInputUp.add(launchBall);
}
//>>>>>>> Stashed changes
function chooseStudent(){
  num = Math.floor((Math.random() * 3));
  while(num==randomIndex)
  {
    num = Math.floor((Math.random() * 3));
  }
  randomIndex=num;
  //randomIndex = 0;
  randomStudent = arrayStudents[randomIndex];
  randomStudent.alpha = 1;
}

function studentHit()
{
    counter++;
    text.text ="Score : " + counter;
    randomStudent.alpha = 0.5;
}

function checkLife(){
  if (lives<=0)
  {
    livesDisplay.text = "GAME OVER";
    text.text = "Click the reset button to play again!"
    randomStudent.alpha = 0.5;
    gradeF.alpha =1;
    gradeF.scale.setTo(0.8,0.8);
    restart();
  }
}


function render() {
    game.debug.text("Drag the ball and release to launch", 32, 32);

}