from flask import Flask, request, abort, render_template, redirect, make_response, jsonify, send_file, \
    send_from_directory
from flask.views import View

import portality.models as models
from portality.core import app
from portality import settings

from portality.view.query import blueprint as query
app.register_blueprint(query, url_prefix='/user_query')

@app.route("/")
def root():
    return render_template("app/search.html")

@app.route("/analyse")
def analyse():
    return render_template("app/analyse.html")

@app.errorhandler(404)
def page_not_found(e):
    return render_template('errors/404.html'), 404


if __name__ == "__main__":
    app.run(host=app.config.get("HOST", "0.0.0.0"), debug=app.config['DEBUG'], port=app.config['PORT'])

