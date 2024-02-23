package com.example.sdcdemoapp.Adapters;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.RadioGroup;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.sdcdemoapp.Interfaces.AddLoadClickListener;
import com.example.sdcdemoapp.Models.Span;
import com.example.sdcdemoapp.Models.PLValue;
import com.example.sdcdemoapp.Models.UDLValue;
import com.example.sdcdemoapp.Models.UVLValue;
import com.example.sdcdemoapp.R;

import java.util.ArrayList;

public class MainAdapter extends RecyclerView.Adapter<MainAdapter.MyViewHolder>{
    Context context;
    ArrayList<Span> spanList;
    UVLAdapter uvlAdapter;
    AlertDialog plDialog, udlDialog, uvlDialog, svDiaog;

    public MainAdapter(Context context, ArrayList<Span> spanList){
        this.context = context;
        this.spanList = spanList;
    }

    @NonNull
    @Override
    public MainAdapter.MyViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.beam_parameters_layout, parent, false);

        return new MainAdapter.MyViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull MainAdapter.MyViewHolder holder, @SuppressLint("RecyclerView") int position) {
        holder.span.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
            }

            @Override
            public void afterTextChanged(Editable s) {
                try {
                    float length = Float.parseFloat(s.toString());
                    spanList.get(position).setSpanLength(length);
                } catch (NumberFormatException e){
                    e.printStackTrace();
                }
            }
        });

        holder.coeff_I.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                try {
                    float length = Float.parseFloat(s.toString());
                    spanList.get(position).setCoeff_I(length);
                } catch (NumberFormatException e){
                    e.printStackTrace();
                }
            }
        });

        holder.settlement_r.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                try {
                    float settlement_r = Float.parseFloat(s.toString());
                    spanList.get(position).setSettlement_r(settlement_r);
                } catch (NumberFormatException e){
                    e.printStackTrace();
                }
            }
        });

        holder.settlement_l.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                try {
                    float settlement_l = Float.parseFloat(s.toString());
                    spanList.get(position).setSettlement_l(settlement_l);
                } catch (NumberFormatException e){
                    e.printStackTrace();
                }
            }
        });

        holder.add_pl.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showPLDialog(holder, position);
            }
        });

        holder.add_udl.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showUDLDialog(holder, position);
            }
        });

        holder.add_uvl.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showUVLDialog(holder, position);
            }
        });

        holder.radioButton_left.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(RadioGroup group, int checkedId) {
                if(checkedId == R.id.hinge_l){
                    spanList.get(position).setLeftSupport("Hinge");
                    spanList.get(position).setAngle_l(1);
                } else if(checkedId == R.id.fixed_l){
                    spanList.get(position).setLeftSupport("Fixed");
                    spanList.get(position).setAngle_l(0);
                } else if (checkedId == R.id.pinned_l) {
                    spanList.get(position).setLeftSupport("Pinned");
                    spanList.get(position).setAngle_l(1);
                } else if (checkedId == R.id.roller_l) {
                    spanList.get(position).setLeftSupport("Roller");
                    spanList.get(position).setAngle_l(1);
                } else if (checkedId == R.id.cantilever_l) {
                    spanList.get(position).setLeftSupport("Cantilever");
                    spanList.get(position).setAngle_l(1);
                }
            }
        });

        holder.radioButton_right.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(RadioGroup group, int checkedId) {
                if(checkedId == R.id.hinge_r){
                    spanList.get(position).setRightSupport("Hinge");
                    spanList.get(position).setAngle_r(1);
                } else if(checkedId == R.id.fixed_r){
                    spanList.get(position).setRightSupport("Fixed");
                    spanList.get(position).setAngle_r(0);
                } else if (checkedId == R.id.pinned_r) {
                    spanList.get(position).setRightSupport("Pinned");
                    spanList.get(position).setAngle_r(1);
                } else if (checkedId == R.id.roller_r) {
                    spanList.get(position).setRightSupport("Roller");
                    spanList.get(position).setAngle_r(1);
                } else if (checkedId == R.id.cantilever_r) {
                    spanList.get(position).setRightSupport("Cantilever");
                    spanList.get(position).setAngle_r(1);
                }
            }
        });

        holder.set_values_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
//                showSpanValues(position);
                solveSpan(position);
            }
        });
    }

    private void solveSpan(int position) {
        float x_r, y_r, z_r, z_l, x_l, y_l;
        float left_force, right_force, total_settlement, span_length, moment_left, moment_right, left_angle, right_angle, coeff_I;
        total_settlement = spanList.get(position).getSettlement_r() - spanList.get(position).getSettlement_l();
        span_length = spanList.get(position).getSpanLength();
        coeff_I = spanList.get(position).getCoeff_I();
        left_angle = spanList.get(position).getAngle_l();
        right_angle = spanList.get(position).getAngle_r();

        float totalPL_R = 0, totalPL_L = 0;
        for (PLValue plValue : spanList.get(position).getPlValues()){
            float a, b, P;
            a = plValue.getDistance();
            b = span_length - a;
            P = plValue.getValue();
            totalPL_L = totalPL_L + (P * a * b * b) / (span_length * span_length);
            totalPL_R = totalPL_R + (P * a * b * b) / (span_length * span_length);
        }

        float totalUDL_R = 0, totalUDL_L = 0;
        for (UDLValue udlValue : spanList.get(position).getUdlValues()){
            if(udlValue.getLoadType().equals("WholeSpan")) {
                float w, l;
                l = udlValue.getSpan();
                w = udlValue.getMagnitude();
                totalUDL_L = totalUDL_L + (w * l * l) / (12);
                totalUDL_R = totalUDL_R + (w * l * l) / (12);
            }
            else if(udlValue.getLoadType().equals("SupportToAnyPoint")){
                if(udlValue.getAnchor().equals("Left")){
                    float w, l;
                    l = udlValue.getSpan();
                    w = udlValue.getMagnitude();
                    totalUDL_L = totalUDL_L + (w * l * l) * (6 * span_length * span_length - 8 * span_length * l + 3 *l *l) / (12 * span_length * span_length);
                    totalUDL_R = totalUDL_R + (w * l * l * l) * (4 * span_length - 3 * l) / (12 * span_length * span_length);
                } else if (udlValue.getAnchor().equals("Right")) {
                    float w, l;
                    l = udlValue.getSpan();
                    w = udlValue.getMagnitude();
                    totalUDL_L = totalUDL_L + (w * l * l * l) * (4 * span_length - 3 * l) / (12 * span_length * span_length);
                    totalUDL_R = totalUDL_R + (w * l * l) * (6 * span_length * span_length - 8 * span_length * l + 3 *l *l) / (12 * span_length * span_length);
                }
            }
            else if(udlValue.getLoadType().equals("Others")){
                float w, l, a, b;
                l = udlValue.getSpan();
                w = udlValue.getMagnitude();
                a = udlValue.getDist_from_left() + (l / 2);
                b = span_length - a;
                totalUDL_L = totalUDL_L + (((w * l) / (span_length * span_length)) * ((a * b * b) + (a - 2 * b) * l * l / 12));
                totalUDL_R = totalUDL_R + (((w * l) / (span_length * span_length)) * ((a * a * b) + (b - 2 * a) * l * l / 12));
            }
        }

        right_force = totalPL_R + totalUDL_R;
        left_force = (totalPL_L + totalUDL_L) * -1;

        right_force = right_force + (2 * -3 * total_settlement) / (span_length * 1000 * span_length);
        left_force = left_force + (2 * -3 * total_settlement) / (span_length * 1000 * span_length);

        z_l = left_force * - 1;
        x_l = 2 * left_angle * 2 * coeff_I / span_length;
        y_l = right_angle * 2 * coeff_I / span_length;

        z_r = right_force * - 1;
        x_r = left_angle * 2 * coeff_I / span_length;
        y_r = 2 * right_angle * 2 * coeff_I / span_length;

        spanList.get(position).setA_left(x_l);
        spanList.get(position).setA_right(x_r);
        spanList.get(position).setB_left(y_l);
        spanList.get(position).setB_right(y_r);
        spanList.get(position).setC_left(left_force);
        spanList.get(position).setC_right(right_force);
//        spanList.get(position).setC_left(z_l);
//        spanList.get(position).setC_right(z_r);

//        Toast.makeText(context, String.valueOf(z_l) + " " + String.valueOf(x_l) + " " + String.valueOf(y_l), Toast.LENGTH_SHORT).show();
//        Toast.makeText(context, String.valueOf(z_r) + " " + String.valueOf(x_r) + " " + String.valueOf(y_r), Toast.LENGTH_SHORT).show();

        Toast.makeText(context, "Values set", Toast.LENGTH_SHORT).show();
    }

    private void showSpanValues(int position) {
        android.app.AlertDialog.Builder dialogBuilder = new android.app.AlertDialog.Builder(context);
        View dialogView = LayoutInflater.from(context).inflate(R.layout.display_span_values_layout, null);
        dialogBuilder.setView(dialogView);
        svDiaog = dialogBuilder.create();

        TextView l_support, r_support, span, l_settlement, r_settlement, pl_values, udl_values;
        l_support = dialogView.findViewById(R.id.left_support);
        l_support.setText(String.valueOf(spanList.get(position).getLeftSupport()));
        r_support = dialogView.findViewById(R.id.right_support);
        r_support.setText(String.valueOf(spanList.get(position).getRightSupport()));
        l_settlement = dialogView.findViewById(R.id.left_settlement);
        l_settlement.setText(String.valueOf(spanList.get(position).getSettlement_l()));
        r_settlement = dialogView.findViewById(R.id.right_settlement);
        r_settlement.setText(String.valueOf(spanList.get(position).getSettlement_r()));
        span = dialogView.findViewById(R.id.span);
        span.setText(String.valueOf(spanList.get(position).getSpanLength()));
        pl_values = dialogView.findViewById(R.id.p_loads);
        for (PLValue plValue : spanList.get(position).getPlValues()){
            Toast.makeText(context, String.valueOf(plValue.getValue()) + " " + String.valueOf(plValue.getDistance()) + " " + String.valueOf(plValue.getID()), Toast.LENGTH_SHORT).show();
        }
        udl_values = dialogView.findViewById(R.id.ud_loads);
        for (UDLValue udlValue : spanList.get(position).getUdlValues()){
            Toast.makeText(context, String.valueOf(udlValue.getSpan()) + " " + String.valueOf(udlValue.getMagnitude()), Toast.LENGTH_SHORT).show();
        }

        svDiaog.show();
    }

    private void showUVLDialog(MyViewHolder holder, int position) {
        android.app.AlertDialog.Builder dialogBuilder = new android.app.AlertDialog.Builder(context);
        View dialogView = LayoutInflater.from(context).inflate(R.layout.count_layout, null);
        dialogBuilder.setView(dialogView);
        uvlDialog = dialogBuilder.create();

        RecyclerView countRV = dialogView.findViewById(R.id.count_RV);
        countRV.setHasFixedSize(true);
        countRV.setLayoutManager(new LinearLayoutManager(context, RecyclerView.VERTICAL, false));
        EditText count = dialogView.findViewById(R.id.count);
        count.setHint("Add UVL count");
        TextView yes_btn, no_button;
        count.requestFocus();
        ImageView check = dialogView.findViewById(R.id.check_btn);
        RelativeLayout options = dialogView.findViewById(R.id.options_holder);

        ArrayList<UVLValue> valuesList = new ArrayList<>();

        check.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                valuesList.clear();
                UVLValue value = new UVLValue();
                int j = 0;
                int x = Integer.parseInt(count.getText().toString());
                spanList.get(position).setUvlCount(x);
                while (j < x){
                    valuesList.add(value);
                    j++;
                }
                uvlAdapter = new UVLAdapter(context, valuesList);
                countRV.setAdapter(uvlAdapter);
                options.setVisibility(View.VISIBLE);
            }
        });

        yes_btn = dialogView.findViewById(R.id.yes_button);
        yes_btn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                uvlDialog.dismiss();
            }
        });

        no_button = dialogView.findViewById(R.id.no_button);
        no_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                uvlDialog.dismiss();
            }
        });

        uvlDialog.setOnDismissListener(new DialogInterface.OnDismissListener() {
            @Override
            public void onDismiss(DialogInterface dialog) {

            }
        });

        uvlDialog.show();
    }

    private void showUDLDialog(MyViewHolder holder, int position) {
        android.app.AlertDialog.Builder dialogBuilder = new android.app.AlertDialog.Builder(context);
        View dialogView = LayoutInflater.from(context).inflate(R.layout.count_layout, null);
        dialogBuilder.setView(dialogView);
        udlDialog = dialogBuilder.create();

        RecyclerView countRV = dialogView.findViewById(R.id.count_RV);
        countRV.setHasFixedSize(true);
        countRV.setLayoutManager(new LinearLayoutManager(context, RecyclerView.VERTICAL, false));
        EditText count = dialogView.findViewById(R.id.count);
        count.setHint("Add UDL count");
        TextView yes_btn, no_button;
        count.requestFocus();
        ImageView check = dialogView.findViewById(R.id.check_btn);
        RelativeLayout options = dialogView.findViewById(R.id.options_holder);

        ArrayList<UDLValue> valuesList = new ArrayList<>();

        check.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                valuesList.clear();
                spanList.get(position).getUdlValues().clear();
                int j = 0;
                int ID = 0;
                int x = Integer.parseInt(count.getText().toString());
                spanList.get(position).setUdlCount(x);
                while (j < x){
                    UDLValue value = new UDLValue(ID);
                    valuesList.add(value);
                    j++;
                    ID++;
                }
                UDLAdapter udlAdapter = new UDLAdapter(context, valuesList, spanList.get(position).getSpanLength());
                countRV.setAdapter(udlAdapter);
                options.setVisibility(View.VISIBLE);
            }
        });

        yes_btn = dialogView.findViewById(R.id.yes_button);
        yes_btn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                for (UDLValue udlValue : valuesList){
                    spanList.get(position).getUdlValues().add(udlValue);
                }
                udlDialog.dismiss();
            }
        });

        no_button = dialogView.findViewById(R.id.no_button);
        no_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                udlDialog.dismiss();
            }
        });

        udlDialog.setOnDismissListener(new DialogInterface.OnDismissListener() {
            @Override
            public void onDismiss(DialogInterface dialog) {

            }
        });

        udlDialog.show();
    }

    private void showPLDialog(MyViewHolder holder, int position) {
        android.app.AlertDialog.Builder dialogBuilder = new android.app.AlertDialog.Builder(context);
        View dialogView = LayoutInflater.from(context).inflate(R.layout.count_layout, null);
        dialogBuilder.setView(dialogView);
        plDialog = dialogBuilder.create();

        RecyclerView countRV = dialogView.findViewById(R.id.count_RV);
        countRV.setHasFixedSize(true);
        countRV.setLayoutManager(new LinearLayoutManager(context, RecyclerView.VERTICAL, false));
        EditText count = dialogView.findViewById(R.id.count);
        count.setHint("Add PL count");
        TextView yes_btn, no_button;
        count.requestFocus();
        ImageView check = dialogView.findViewById(R.id.check_btn);
        RelativeLayout options = dialogView.findViewById(R.id.options_holder);

        ArrayList<PLValue> valuesList = new ArrayList<>();

        check.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                spanList.get(position).getPlValues().clear();
                valuesList.clear();
                int j = 0;
                int ID = 0;
                int x = Integer.parseInt(count.getText().toString());
                spanList.get(position).setPlCount(x);
                while (j < x){
                    PLValue value = new PLValue(ID);
                    valuesList.add(value);
                    j++;
                    ID++;
                }
                PLAdapter plAdapter = new PLAdapter(context, valuesList);
                countRV.setAdapter(plAdapter);
                options.setVisibility(View.VISIBLE);
            }
        });

        yes_btn = dialogView.findViewById(R.id.yes_button);
        yes_btn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                for (PLValue plValue : valuesList){
                    spanList.get(position).getPlValues().add(plValue);
                }

                plDialog.dismiss();
            }
        });

        no_button = dialogView.findViewById(R.id.no_button);
        no_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                plDialog.dismiss();
            }
        });

        plDialog.setOnDismissListener(new DialogInterface.OnDismissListener() {
            @Override
            public void onDismiss(DialogInterface dialog) {

            }
        });

        plDialog.show();
    }

    @Override
    public int getItemCount() {
        return spanList.size();
    }

    public class MyViewHolder extends RecyclerView.ViewHolder {
        RelativeLayout add_pl, add_udl, add_uvl;
        RecyclerView pl_RV, udl_RV, uvl_RV;
        RadioGroup radioButton_right, radioButton_left;
        TextView set_values_button;
        EditText span, settlement_r, settlement_l, coeff_I;
        public MyViewHolder(@NonNull View itemView) {
            super(itemView);
            add_pl = itemView.findViewById(R.id.pl_btn);
            pl_RV = itemView.findViewById(R.id.pl_RV);

            add_udl = itemView.findViewById(R.id.udl_btn);
            udl_RV = itemView.findViewById(R.id.udl_RV);

            add_uvl = itemView.findViewById(R.id.uvl_btn);
            uvl_RV = itemView.findViewById(R.id.uvl_RV);

            radioButton_left = itemView.findViewById(R.id.left_radio);
            radioButton_right = itemView.findViewById(R.id.radio_right);

            set_values_button = itemView.findViewById(R.id.set_values);

            span = itemView.findViewById(R.id.beam_length);
            settlement_l = itemView.findViewById(R.id.settlement_l);
            settlement_r = itemView.findViewById(R.id.settlement_r);
            coeff_I = itemView.findViewById(R.id.coefficient_I);
        }
    }
}
