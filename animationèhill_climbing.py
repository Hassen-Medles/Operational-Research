import matplotlib.pyplot as plt
import matplotlib.animation as animation
import numpy as np



import os
import json



# Configuration
FOLDER = "anim"

# # Création des courbes de colline
# x = np.linspace(0, 10, 1000)
# y = np.sin(0.5 * x) * 2 + np.exp(-0.3 * (x - 3)**2) * 4 + np.exp(-0.5 * (x - 7)**2) * 6

# # Position initiale de l'objet
# object_path_x = np.linspace(0, 4, 100)
# object_path_y = np.sin(0.5 * object_path_x) * 2 + np.exp(-0.3 * (object_path_x - 3)**2) * 4 + np.exp(-0.5 * (object_path_x - 7)**2) * 6

# fig, ax = plt.subplots(figsize=(8, 4))
# line, = ax.plot(x, y, lw=2)
# point, = ax.plot([], [], 'ro', markersize=10)
# text = ax.text(0.5, 6.5, '', fontsize=12, ha='center')

# ax.set_xlim(0, 10)
# ax.set_ylim(0, 8)
# ax.set_title("Illustration d'un optimum local")

# # Animation update function
# def update(frame):
#     x_obj = object_path_x[frame]
#     y_obj = object_path_y[frame]
#     point.set_data(x_obj, y_obj)
#     if frame == len(object_path_x) - 1:
#         text.set_text("Je suis au sommet ! 🥳")
#     else:
#         text.set_text("")
#     return point, text

# ani = animation.FuncAnimation(fig, animate, frames=100,
#                               interval=1, blit=True, repeat=False)
# plt.show()

k = 2*np.pi
w = 2*np.pi
dt = 0.01

xmin = 0
xmax = 3
nbx = 151

x = np.linspace(xmin, xmax, nbx)

fig = plt.figure() # initialise la figure
line, = plt.plot([], []) 
plt.xlim(xmin, xmax)
plt.ylim(-1, 1)

def animate(i): 
    t = i * dt
    y = np.cos(k*x - w*t)
    line.set_data(x, y)
    return line,
 
ani = animation.FuncAnimation(fig, animate, frames=100,
                              interval=1, blit=True, repeat=False)





# # Enregistrement du GIF
gif_path = os.path.join(FOLDER, "hill_climbing_optimum_local.gif")
ani.save(gif_path, writer='pillow', fps=10)

# gif_path


# plt.show()
