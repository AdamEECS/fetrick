from flask import Flask
from flask import render_template
app = Flask(__name__)

@app.route("/")
def hello():
    return render_template('index.html')

@app.route("/canvas")
def canvas():
    return render_template('canvas.html')

if __name__ == "__main__":
    app.run()
