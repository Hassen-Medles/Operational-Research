"""
============
3D animation
============

A simple example of an animated plot... In 3D!
"""
import numpy as np
import matplotlib.pyplot as plt
import mpl_toolkits.mplot3d.axes3d as p3
import matplotlib.animation as animation
import os

x = np.linspace(0, 10, 1000)
y = np.sin(0.5 * x) * 1.5 + np.exp(-1.0 * (x - 2)**2) * 2 + np.exp(-0.2 * (x - 7)**2) * 6


# Position initiale de l'objet (il s'arrête à la petite bosse vers x = 2)
object_path_x = np.linspace(0, 2.5, 100)
object_path_y = np.sin(0.5 * object_path_x) * 1.5 + np.exp(-1.0 * (object_path_x - 2)**2) * 2 + np.exp(-0.2 * (object_path_x - 7)**2) * 6


fig, ax = plt.subplots(figsize=(8, 4))
line, = ax.plot(x, y, lw=2)
point, = ax.plot([], [], 'ro', markersize=10)
text = ax.text(0.5, 6.5, '', fontsize=12, ha='center')

ax.set_xlim(0, 10)
ax.set_ylim(0, 8)
ax.set_title("Illustration d'un optimum local")

# Animation update function
def update(frame):
    x_obj = object_path_x[frame]
    y_obj = object_path_y[frame]
    point.set_data([x_obj], [y_obj])
    if frame == len(object_path_x) - 1:
        text.set_text("Je suis au sommet !")
    else:
        text.set_text("")
    return point, text

# Creating the Animation object
stop_x = 2  # Choisis la valeur de x où tu veux stopper
stop_index = np.argmin(np.abs(object_path_x - stop_x))
pause_frames = 40  # pour durer plus longtemps sur la dernière frame
frames = list(range(stop_index + 1)) + [stop_index] * pause_frames

# Animation avec les frames customisées
line_ani = animation.FuncAnimation(fig, update, frames=frames, interval=100, blit=True)



FOLDER = "anim"
gif_path = os.path.join(FOLDER, "hill_climbing_optimum_local.gif")
line_ani.save(gif_path, writer='pillow', fps=20)

plt.show()