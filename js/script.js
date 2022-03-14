var app = document.getElementById("typewrite");

var typewriter = new Typewriter(app, {
  loop: true,
  delay: 75,
});

typewriter
  .typeString("Welcome to the world of Aluman")
  .deleteChars(30)
  .typeString("<strong>(.)v(.)</strong>Be ready to get weirder ")
  .start();
