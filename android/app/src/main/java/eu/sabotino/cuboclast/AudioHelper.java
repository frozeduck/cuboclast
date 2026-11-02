package eu.sabotino.cuboclast;

import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioTrack;
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class AudioHelper {
    private static final int SAMPLE_RATE = 22050;
    private static final ExecutorService executor = Executors.newFixedThreadPool(3);
    private static volatile boolean soundEnabled = true;

    // Scala pentatonica do-re-mi-sol-la per il crescendo dei rimbalzi stile Peggle
    private static final float[] PENTATONIC_SCALE = {
            261.63f, // C4
            293.66f, // D4
            329.63f, // E4
            392.00f, // G4
            440.00f, // A4
            523.25f, // C5
            587.33f, // D5
            659.25f, // E5
            783.99f, // G5
            880.00f, // A5
            1046.50f,// C6
            1174.66f,// D6
            1318.51f,// E6
            1567.98f // G6
    };

    public static void toggleSound() {
        soundEnabled = !soundEnabled;
    }

    public static boolean isSoundEnabled() {
        return soundEnabled;
    }

    public static void setSoundEnabled(boolean enabled) {
        soundEnabled = enabled;
    }

    private static void playBuffer(final short[] buffer) {
        if (!soundEnabled || buffer == null || buffer.length == 0) return;
        executor.execute(() -> {
            try {
                AudioTrack track = new AudioTrack.Builder()
                        .setAudioAttributes(new AudioAttributes.Builder()
                                .setUsage(AudioAttributes.USAGE_GAME)
                                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                                .build())
                        .setAudioFormat(new AudioFormat.Builder()
                                .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                                .setSampleRate(SAMPLE_RATE)
                                .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                                .build())
                        .setBufferSizeInBytes(buffer.length * 2)
                        .setTransferMode(AudioTrack.MODE_STATIC)
                        .build();

                track.write(buffer, 0, buffer.length);
                track.play();

                long durMs = (long) ((float) buffer.length / SAMPLE_RATE * 1000f) + 15;
                Thread.sleep(Math.min(durMs, 350));
                track.stop();
                track.release();
            } catch (Exception ignored) {
            }
        });
    }

    // Rimbalzo su Cubo con nota della scala proporzionale alla combo
    public static void playBounceHit(int combo) {
        if (!soundEnabled) return;
        int noteIndex = Math.min(Math.max(combo - 1, 0), PENTATONIC_SCALE.length - 1);
        float freq = PENTATONIC_SCALE[noteIndex];

        int n = (int) (SAMPLE_RATE * 0.10f); // 100 ms
        short[] buf = new short[n];
        for (int i = 0; i < n; i++) {
            float t = (float) i / SAMPLE_RATE;
            float decay = (float) Math.exp(-t * 28.0);
            float sample = (float) (Math.sin(2.0 * Math.PI * freq * t) * 0.75
                    + Math.sin(4.0 * Math.PI * freq * t) * 0.25);
            buf[i] = (short) (sample * decay * 28000);
        }
        playBuffer(buf);
    }

    // Distruzione Cubo (Shatter esplosivo minimalistico)
    public static void playCubeShatter() {
        if (!soundEnabled) return;
        int n = (int) (SAMPLE_RATE * 0.16f); // 160 ms
        short[] buf = new short[n];
        Random rnd = new Random();
        for (int i = 0; i < n; i++) {
            float t = (float) i / SAMPLE_RATE;
            float decay = (float) Math.exp(-t * 18.0);
            float bass = (float) Math.sin(2.0 * Math.PI * (120f - t * 400f) * t);
            float noise = (rnd.nextFloat() * 2f - 1f) * 0.35f;
            buf[i] = (short) ((bass * 0.65f + noise) * decay * 29000);
        }
        playBuffer(buf);
    }

    // Lancio Sfera (Pneumatic Pop)
    public static void playLaunch() {
        if (!soundEnabled) return;
        int n = (int) (SAMPLE_RATE * 0.08f);
        short[] buf = new short[n];
        for (int i = 0; i < n; i++) {
            float t = (float) i / SAMPLE_RATE;
            float freq = 340f + t * 900f;
            float decay = (float) Math.exp(-t * 35.0);
            buf[i] = (short) (Math.sin(2.0 * Math.PI * freq * t) * decay * 24000);
        }
        playBuffer(buf);
    }

    // Cattura nel Cestello / Portale inferiore (Arpeggio di successo)
    public static void playCatch() {
        if (!soundEnabled) return;
        int n = (int) (SAMPLE_RATE * 0.20f);
        short[] buf = new short[n];
        for (int i = 0; i < n; i++) {
            float t = (float) i / SAMPLE_RATE;
            float f = (t < 0.06f) ? 523.25f : (t < 0.12f ? 659.25f : 783.99f);
            float decay = (float) Math.exp(-(t % 0.06f) * 20.0);
            buf[i] = (short) (Math.sin(2.0 * Math.PI * f * t) * decay * 26000);
        }
        playBuffer(buf);
    }

    // Esplosione Cubo Bomb (Sub-Bass Boom)
    public static void playExplosion() {
        if (!soundEnabled) return;
        int n = (int) (SAMPLE_RATE * 0.24f);
        short[] buf = new short[n];
        Random rnd = new Random();
        for (int i = 0; i < n; i++) {
            float t = (float) i / SAMPLE_RATE;
            float decay = (float) Math.exp(-t * 12.0);
            float sub = (float) Math.sin(2.0 * Math.PI * (80f - t * 200f) * t);
            float crunch = (rnd.nextFloat() * 2f - 1f) * 0.45f;
            buf[i] = (short) ((sub * 0.7f + crunch * 0.3f) * decay * 31000);
        }
        playBuffer(buf);
    }

    // Scelta Reliquia Roguelike (Campana armonica di selezione)
    public static void playRelicSelect() {
        if (!soundEnabled) return;
        int n = (int) (SAMPLE_RATE * 0.25f);
        short[] buf = new short[n];
        for (int i = 0; i < n; i++) {
            float t = (float) i / SAMPLE_RATE;
            float decay = (float) Math.exp(-t * 10.0);
            float s = (float) (Math.sin(2.0 * Math.PI * 440f * t) * 0.4
                    + Math.sin(2.0 * Math.PI * 659.25f * t) * 0.4
                    + Math.sin(2.0 * Math.PI * 880f * t) * 0.2);
            buf[i] = (short) (s * decay * 28000);
        }
        playBuffer(buf);
    }

    // Fulmine a Catena (Zap elettrico)
    public static void playChainZap() {
        if (!soundEnabled) return;
        int n = (int) (SAMPLE_RATE * 0.09f);
        short[] buf = new short[n];
        Random rnd = new Random();
        for (int i = 0; i < n; i++) {
            float t = (float) i / SAMPLE_RATE;
            float decay = (float) Math.exp(-t * 30.0);
            float chirp = (float) Math.sin(2.0 * Math.PI * (1200f - t * 6000f) * t);
            float crackle = (rnd.nextFloat() * 2f - 1f) * 0.5f;
            buf[i] = (short) ((chirp * 0.5f + crackle * 0.5f) * decay * 27000);
        }
        playBuffer(buf);
    }
}
