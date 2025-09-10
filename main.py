import os
import eel

from engine.features import *

eel.init('www')
os.system('start msedge.exe --app="http://127.0.0.1:5500/www/index.html"')
playAssistantSound()

eel.start('index.html', mode=None, host='localhost',block=True)