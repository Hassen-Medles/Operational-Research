from flask import Flask, render_template, redirect, url_for, request

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")


@app.route('/success/<name>')
def success(name):
   return 'welcome %s' % name



@app.route('/login',methods = ['POST', 'GET'])
def login():
   if request.method == 'POST':
      user = request.form['nm']
      return redirect(url_for('success',name = user))
   else:
      user = request.args.get('nm')
      return redirect(url_for('success',name = user))

if __name__ == '__main__':
   app.run(debug = True)




if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
