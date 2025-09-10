import os
import eel

from engine.features import *

eel.init('www')
os.system('start msedge.exe --app="http://localhost:8000/index.html"')
playAssistantSound()

eel.start('index.html', mode=None, host='localhost', port=8000, block=True)