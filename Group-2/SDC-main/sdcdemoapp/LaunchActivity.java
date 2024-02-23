package com.example.sdcdemoapp;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;
import android.widget.ImageView;

public class LaunchActivity extends AppCompatActivity {
    ImageView launchImage;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_launch);

        initViews();
        setImageWithFade(R.drawable.datniqqawhizz, 2500);
    }

    private void setImageWithFade(int imageResourceID, long duration) {
        Drawable image = getResources().getDrawable(imageResourceID);
        launchImage.setImageDrawable(image);
        Animation fadeIn = new AlphaAnimation(0, 1);
        fadeIn.setDuration(duration);
        fadeIn.setAnimationListener(new Animation.AnimationListener() {
            @Override
            public void onAnimationStart(Animation animation) {

            }

            @Override
            public void onAnimationEnd(Animation animation) {
                startActivity(new Intent(LaunchActivity.this, MainActivity.class));
                finish();
            }

            @Override
            public void onAnimationRepeat(Animation animation) {

            }
        });
        launchImage.startAnimation(fadeIn);
    }

    private void initViews() {
        launchImage = findViewById(R.id.launch_image);
    }
}