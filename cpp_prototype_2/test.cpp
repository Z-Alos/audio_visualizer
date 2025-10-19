#include "raylib.h"

int main() {
    InitWindow(1280, 800, "Audio Visualizer");

    InitAudioDevice(); // Initialize audio device

    Music music = LoadMusicStream("../oui.mp3");

    PlayMusicStream(music);
    bool isMusicPlaying = true;

    while (!WindowShouldClose()) {
        // Update
        UpdateMusicStream(music);

        // Music Toggle
        if (IsKeyPressed(KEY_SPACE)){
            if(isMusicPlaying){
                PauseMusicStream(music);
            }
            else {
                ResumeMusicStream(music);
            }

            // Toggle isMusicPlaying
            isMusicPlaying = !isMusicPlaying;
        }

        // Draw
        BeginDrawing();
        ClearBackground(RED);
        EndDrawing();
    }

    // Terminate Program
    UnloadMusicStream(music);
    CloseAudioDevice();
    CloseWindow();

    return 0;
}

