class WaitingsController < ApplicationController
  before_action :set_waiting, only: %i[ show edit update destroy ]
  before_action :ensure_admin, only: %i[ index show edit update destroy ]

  # GET /waitings or /waitings.json
  def index
    @waitings = Waiting.all
  end

  # GET /waitings/1 or /waitings/1.json
  def show
  end

  # GET /waitings/new
  def new
    @waiting = Waiting.new
  end

  # GET /waitings/1/edit
  def edit
  end

  # POST /waitings or /waitings.json
  def create
    @waiting = Waiting.new(waiting_params)
    puts "ciaoooidoasids"

    respond_to do |format|
      if @waiting.save
        format.html { redirect_to root_path, notice: "You successfully join wait list." }
        format.json { render :show, status: :created, location: @waiting }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @waiting.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /waitings/1 or /waitings/1.json
  def update
    respond_to do |format|
      if @waiting.update(waiting_params)
        format.html { redirect_to @waiting, notice: "Waiting was successfully updated.", status: :see_other }
        format.json { render :show, status: :ok, location: @waiting }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @waiting.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /waitings/1 or /waitings/1.json
  def destroy
    @waiting.destroy!

    respond_to do |format|
      format.html { redirect_to waitings_path, notice: "Waiting was successfully destroyed.", status: :see_other }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_waiting
      @waiting = Waiting.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def waiting_params
      params.require(:waiting).permit(:email, :name, :discovered)
    end

    def ensure_admin
      unless current_user.admin?
        redirect_to root_path, alert: "Access denied."
      end
    end
end
