## Python Flask Skeleton for Google App Engine

A skeleton for building Python applications on Google App Engine with the
[Flask micro framework](http://flask.pocoo.org).

See our other [Google Cloud Platform github
repos](https://github.com/GoogleCloudPlatform) for sample applications and
scaffolding for other python frameworks and use cases.

## Run Locally
1. Install the [App Engine Python SDK](https://developers.google.com/appengine/downloads).
See the README file for directions. You'll need python 2.7 (appengine can crash in windows with python 2.7+, please install phyton 2.7.9) and [pip 1.4 or later](http://www.pip-installer.org/en/latest/installing.html) installed too.

2. Clone this repo with

   ```
   git clone git@git.assembla.com:eforcers.esmg.git
   ```
3. Install dependencies in the project's lib directory.
   Note: App Engine can only import libraries from inside your project directory.

   ```
   cd eforcers.esmg
   pip install -r requirements.txt -t lib
   ```
   Is necesary to add the next code fragment in /lib/pipeline/util.py

   over definition of

        version = os.environ["CURRENT_VERSION_ID"].split(".")[0]
        module = os.environ["CURRENT_MODULE_ID"]

   in method _get_task_target():

   the code is:

   if os.environ['SERVER_SOFTWARE'].startswith('Dev'):
    return module


4. Install bower dependencies in static/components.
   Note: before install node and bower.

   ```
   cd eforcers.esmg
   bower install
   ```
6. IMPORTANT: in lib/piplines/util.py:66, after of ( module = os.environ["CURRENT_MODULE_ID"]) paste:

   ```
   if os.environ['SERVER_SOFTWARE'].startswith('Dev'):
       return module
   ```
   
7. Run this project locally from the command line:

   ```
   dev_appserver.py .
   ```

Visit the application [http://localhost:8080](http://localhost:8080)

See [the development server documentation](https://developers.google.com/appengine/docs/python/tools/devserver)
for options when running dev_appserver.

## Deploy
To deploy the application:

1. Use the [Admin Console](https://appengine.google.com) to create a
   project/app id. (App id and project id are identical)
1. [Deploy the
   application](https://developers.google.com/appengine/docs/python/tools/uploadinganapp) with

   ```
   appcfg.py -A <your-project-id> --oauth2 update .
   ```
1. Congratulations!  Your application is now live at your-app-id.appspot.com

## Next Steps
This skeleton includes `TODO` markers to help you find basic areas you will want
to customize.

### Relational Databases and Datastore
To add persistence to your models, use
[NDB](https://developers.google.com/appengine/docs/python/ndb/) for
scale.  Consider
[CloudSQL](https://developers.google.com/appengine/docs/python/cloud-sql)
if you need a relational database.

### Installing Libraries
See the [Third party
libraries](https://developers.google.com/appengine/docs/python/tools/libraries27)
page for libraries that are already included in the SDK.  To include SDK
libraries, add them in your app.yaml file. Other than libraries included in
the SDK, only pure python libraries may be added to an App Engine project.

### Feedback
Star this repo if you found it useful. Use the github issue tracker to give
feedback on this repo.

## Contributing changes
See [CONTRIB.md](CONTRIB.md)

## Licensing
See [LICENSE](LICENSE)

## Author
Logan Henriquez and Johan Euphrosine
